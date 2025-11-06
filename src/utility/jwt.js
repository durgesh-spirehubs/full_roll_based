import jwt from "jsonwebtoken";
const EXPIRE_IN = Math.floor(new Date().getTime() / 1000) + 24 * 24 * 60 * 60;
export const generateToken = (user) => {
    return jwt.sign(
      {
        id: user.id,          
        email: user.email,
        user_type: user.user_type,
        role_id: user.role_id,
        expiresIn: EXPIRE_IN,
      },
      process.env.JWT_SECRET,
      //{ expiresIn: "1d" }      
    );
  };
export const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
