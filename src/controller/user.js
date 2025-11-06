import db from "../models/index.js";
const { Users, Roles }=db;
import bcrypt from "bcrypt";
import { generateToken } from "../utility/jwt.js";
import { Op } from "sequelize";
// export const register = async (req, res) => {
//   const { name, email, password, user_type, role_id, status } = req.body;
//   try {
//     const hashpassword = await bcrypt.hash(password, 10);
//     const duplicate = await USERS.findOne({
//       where: { email: email },
//       attributes: ["id"],
//     });
//     if (duplicate) {
//       return res.status(400).json({
//         message: "email is already registered ",
//       });
//     }
//     const user = await USERS.create({
//       name: name,
//       email: email,
//       password: hashpassword,
//       user_type: user_type,
//       role_id: role_id,
//       status: status,
//     });
//     const token = generateToken(user);
//     res.status(200).json({
//       message: "token will be generated",
//       token: token,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "server error",
//     });
//   }
// };
export const register = async (req, res, next) => {
  const { name, email, password, user_type, role_id, status } = req.body;
  console.log(name, email, password);
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    const [user, created] = await Users.findOrCreate({
      where: { email },
      defaults: {
        name: name,
        email: email,
        password: hashpassword,
        user_type: user_type,
        role_id: role_id,
        status: status,
      },
    });
    if (!created) {
      return res.status(400).json({
        message: "user already exist",
      });
    }
    const token = generateToken(user);
    return res.status(201).json({
      message: "registration successful",
      token: token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email ",
      });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Invalid  password",
      });
    }
    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Failed to login",
    });
  }
};
export async function getUsers(req, res, next) {
  let query = {};
  try {
    let limit = req?.query?.limit ? Number(req.query.limit) : 10;
    if (req.query?.page) {
      query["limit"] = limit;
      query["offset"] = (Number(req.query.page) - 1) * limit;
    }
    let order = req.query?.order ? req.query?.order : "desc";
    if (req.query?.orderBy) {
      query["order"] = [[req.query?.orderBy, order]];
    } else {
      query["order"] = [["id", order]];
    }
    query["where"] = {
      status: {
        [Op.or]: ["Active", "Inactive"],
      },
    };
    if (req.query?.search) {
      query["where"][Op.or] = [
        { name: { [Op.like]: "%" + req.query?.search + "%" } },
        { email: { [Op.like]: "%" + req.query?.search + "%" } },
        { user_type: { [Op.like]: "%" + req.query?.search + "%" } },
      ];
    }
    query["attributes"] = ["id", "name", "email", "status"];
    query["include"] = [
      {
        model: Roles,
        attributes: ["id", "departmentID", "roleName"],
        as: "role",
      },
    ];
    let data = await Users.findAndCountAll(query);
    res.status(200).json({
      message: "success",
      total: data.count,
      data: data.rows,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}
