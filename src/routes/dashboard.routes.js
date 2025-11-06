import { Router } from "express";
import { ensureAuth } from "../middleware/auth.js";
import { dashboardata, dashboardfilterLead } from "../controller/dashboard.js";
const router=Router();

router.get("/lead",ensureAuth("Admin"),dashboardfilterLead );
router.get("/count",ensureAuth("Admin"),dashboardata);
export default router;