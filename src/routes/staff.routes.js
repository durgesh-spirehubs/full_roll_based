import {Router} from 'express';
import { ensureAuth } from '../middleware/auth.js';
import { createStaff, deleteStaff, getallStaff, updateStaff } from '../controller/staff.js';
const router=Router();

router.post("/",ensureAuth("Staff","Admin"),createStaff);
router.patch("/:id",ensureAuth("Admin","Staff"),updateStaff);
router.delete("/:id",ensureAuth("Admin","Staff"),deleteStaff);
router.get("/:id",ensureAuth("Admin"),getallStaff);
export default router;