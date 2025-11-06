import {Router} from "express";
import { register,login, getUsers} from "../controller/user.js";
import { ensureAuth } from "../middleware/auth.js";
import { checkSchema } from "express-validator";
import validator from "../middleware/validator.js";
import { userValidation } from "../validation/users.js";
const router=Router();
router.post("/register",  [checkSchema(userValidation), validator],register);
router.post("/login",login)
router.get("/", ensureAuth("Admin","Staff","User"), getUsers);
export default router;
