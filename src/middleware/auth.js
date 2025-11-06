import { decodeToken } from "../utility/jwt.js";
import db from "../models/index.js";
const { Users, Roles } =db;
export const setModule = (module) => {
  return function (req, res, next) {
    req.module = module;
    switch (req.method) {
      case "GET":
        req.permission = { module: module + "-read" };
        break;
      case "POST":
        req.permission = { module: module + "-write" };
        break;
      case "PUT":
        req.permission = { module: module + "-write" };
        break;
      case "PATCH":
        req.permission = { module: module + "-all" };
        break;
      case "DELETE":
        req.permission = { module: module + "-all" };
        break;
      default:
        break;
    }
    next();
  };
};
export const ensureAuth = (...allowedUserTypes) => {
  return async function (req, res, next) {
    try {
      if (!req.headers.authorization && allowedUserTypes.includes("Guest")) {
        return next();
      }
      if (!req.headers.authorization) {
        return res
          .status(403)
          .json({ message: "Authorization header missing" });
      }
      const token = req.headers.authorization.replace(/^Bearer\s+/, "");
      let payload;
      try {
        payload = decodeToken(token);
        console.log(payload.expiresIn);
        if (payload.expiresIn < Math.floor(new Date().getTime() / 1000)) {
          return res.status(401).json({
            message: "token expire",
          });
        }
      } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      const user = await Users.findOne({
        where: { id: payload.id },
        include: [{ model: Roles, as: "role" }],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const accessList = user.role?.accessID
        ? user.role.accessID.split(",")
        : [];
      req.user = user;
      req.user.hasAccess = (permissionID) => {
        return accessList.includes(permissionID) || user.user_type === "Admin";
      };
      req.permission = {};
      req.permission.global =
        user.user_type === "Admin" ||
        accessList.includes(`${req.module}-global`);
      if (
        user.user_type === "Admin" ||
        allowedUserTypes.includes(user.user_type) ||
        allowedUserTypes.includes("Guest")
      ) {
        return next();
      }
      if (!accessList.includes(req.module)) {
        return res.status(403).json({ message: "Access Denied" });
      }
      next();
    } catch (err) {
      console.error("Auth error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
