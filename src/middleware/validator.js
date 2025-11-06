
import { validationResult } from "express-validator";
export default (req, res, next) => {
  console.log(req.headers.locale)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "error",
      type: "validation error",
      errors: errors.array(),
    });
  } else {
    next();
  }
};
