import {Router} from "express";
import { ensureAuth } from "../middleware/auth.js";
import { clockIn, clockOut, deleteAttendance, getAttendance, totaltimehour } from "../controller/attendance.js";
const router=Router();

router.post("/clockIn",ensureAuth("Admin","Staff","User"),clockIn);
router.post("/clockOut/:id",ensureAuth("Admin","Staff","User"),clockOut);
router.delete("/:id",ensureAuth("Admin","Staff"),deleteAttendance);
router.get("/",ensureAuth("Admin","Staff","User"),getAttendance);
router.get("/time",ensureAuth("Admin","Staff","User"),totaltimehour);
export default router;