import { Router } from "express";
import { assignInquiry, bulkinquire, converttolead, createInquiry, getInquiry, unassignInquiry, updateInquiry } from "../controller/inquriy.js";
import { ensureAuth } from "../middleware/auth.js";

const router=Router();

router.post("/",ensureAuth("Admin","Staff","User"),createInquiry);
router.patch("/:id",ensureAuth("Admin"),updateInquiry);
router.get("/",ensureAuth("Admin","Staff","User"),getInquiry);
router.post("/:id",ensureAuth("Admin","Staff"),assignInquiry);
router.post("/assign-bulk",ensureAuth("Admin","Staff"),bulkinquire);
router.patch("/un-assignInquiry/:id",ensureAuth("Admin","Staff"),unassignInquiry);
router.post("/convert-lead/:id",ensureAuth("Admin","Staff"),converttolead);

export default router;
