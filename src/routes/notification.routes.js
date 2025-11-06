import {Router} from "express";
import { ensureAuth } from "../middleware/auth.js";
import { deleteNotification, getNotification, updateNotification, updateStatusNotification } from "../controller/notification.js";
const router=Router();

router.patch("/:id",ensureAuth("Admin","Staff"),updateStatusNotification);
router.put("/:id",ensureAuth("Admin","Staff"),updateNotification);
router.delete("/:id",ensureAuth("Admin","Staff"),deleteNotification);
router.get("/",ensureAuth("Admin","Staff","User"),getNotification);
export default router;
