import {Router} from "express";
import { addMember, createRoom, history,fetchRoom} from "../controller/chat.js";
const router=Router();
router.post("/createRoom",createRoom);
router.post("/addMember",addMember);
router.get("/history/:id",history);
router.get("/fetchRoom/:id",fetchRoom);
export default router;