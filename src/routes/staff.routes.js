import {Router} from 'express';
import { ensureAuth } from '../middleware/auth.js';
import { createStaff, deleteStaff, getStaff, getallStaff, updateStaff } from '../controller/staff.js';
const router=Router();

router.post("/",ensureAuth("Staff","Admin"),createStaff);
router.patch("/:id",ensureAuth("Admin","Staff"),updateStaff);
router.delete("/:id",ensureAuth("Admin","Staff"),deleteStaff);
router.get("/:id",ensureAuth("Admin"),getallStaff);
router.get("/",ensureAuth("Admin","Staff","User"),getStaff);
export default router;