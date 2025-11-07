import {Router} from "express";
import { addMember, createRoom, history } from "../controller/chat.js";
const router=Router();
router.post("/createRoom",createRoom);
router.post("/addMember",addMember);
router.get("/history/:id",history);
export default router;