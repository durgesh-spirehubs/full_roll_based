import db from "../models/index.js";
import { decodeToken } from "../utility/jwt.js";
const { Message, Rooms, RoomMembers, Users } = db;

export const createRoom= async (req, res) => {
    try {
      const { senderId, roomName, text } = req.body;
      const data = await Rooms.create({
        senderId: senderId,
        roomName: roomName,
        text: text,
      });
      res.status(200).json({
        message: "successful room created",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        messge: "fail to create room",
      });
    }
  }

  export const addMember= async (req, res) => {
    const { roomId, senderId } = req.body;
    try {
      const rooMember = await RoomMembers.create({
        roomId: roomId,
        senderId: senderId,
      });
      res.status(200).json({
        message: "successful member added",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "server error",
      });
    }
}
export const history= async (req, res) => {
    try {
      const data = await Message.findAll({
        where: { roomId: req.params.id },
        include: {
          model: Users,
          as: "authorDetail",
          attributes: ["name"],
        },
      });
      if (!data) {
        res.status(404).json({
          message: "No data found",
        });
      }
      res.status(200).json({
        message: "history found in room",
        data: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "server serror",
      });
    }
  };
    