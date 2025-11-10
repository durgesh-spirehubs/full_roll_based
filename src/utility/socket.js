import db from "../models/index.js";
import { decodeToken } from "./jwt.js";
const { Message, Rooms, RoomMembers, Users } = db;
import { Op, fn, col } from "sequelize";
const clients = new Map();
const rooms = new Map();
export const sockethandler = (socket, req) => {
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const token = urlParams.get("token");
  if (!token) {
    socket.send("token required");
    socket.close();
    return;
  }
  const decoded = decodeToken(token);
  if (!decoded || !decoded.id) {
    socket.send(JSON.stringify({ type: "error", message: "invalid token" }));
    socket.close();
    return;
  }
  const authorId = decoded.id;
  socket.on("message", async (message) => {
    try {
      const msg = JSON.parse(message);
      const { type, roomId, text, seen, messageId } = msg;
      if (!type) {
        socket.send(JSON.stringify({ type: "error", message: "error occur" }));
        return;
      }
      const room = await Rooms.findOne({ where: { id: roomId } });
      if (!room) {
        socket.send(
          JSON.stringify({ type: "error", message: "room not found" })
        );
        return;
      }
      if (type === "join") {
        const isMember = await RoomMembers.findOne({
          where: { roomId, senderId: authorId },
        });
        if (!isMember) await RoomMembers.create({ roomId, senderId: authorId });
        clients.set(authorId, socket);
        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(authorId);
        socket.send(JSON.stringify({ type: "joined", roomId, authorId }));
      } else if (type === "message") {
        if (!text) {
          socket.send(
            JSON.stringify({ type: "error", message: "missing text" })
          );
          return;
        }
        const member = await RoomMembers.findOne({
          where: { roomId: roomId, senderId: authorId },
        });
        if (!member) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "You are not a member of this room",
            })
          );
          return;
        }
        const newMessage = await Message.create({
          roomId,
          authorId,
          text,
          seen: false,
          raw: true,
        });
        const plainMessage = newMessage.toJSON();
        await Rooms.update({ text }, { where: { id: roomId } });
        const data = await Users.findOne({
          where: { id: authorId },
          attributes: ["name"],
        });
        const name = data.dataValues.name;
        const sendMessage = { ...plainMessage, name: name };
        const roomMembers = await RoomMembers.findAll({ where: { roomId } });
        for (const roomMember of roomMembers) {
          const userId = roomMember.senderId;
          const clientSocket = clients.get(userId);
          if (clientSocket && clientSocket.readyState === 1) {
            clientSocket.send(JSON.stringify({ type: "message", sendMessage }));
          }
        }
      } else if (type === "seen") {
        await Message.update(
          { seen },
          {
            where: {
              roomId,
              authorId: { [Op.ne]: authorId },
              seen: false,
            },
          }
        );
        const roomMember = await RoomMembers.findAll({ where: { roomId } });
        for (const member of roomMember) {
          const userId = member.senderId;
          const clientSocket = clients.get(userId);
          if (clientSocket && clientSocket.readyState == 1) {
            clientSocket.send(
              JSON.stringify({ type: "seen", roomId, seenby: authorId })
            );
          }
        }
      } else if (type === "delete") {
        console.log("delete", authorId);
        if (!messageId) {
          socket.send(
            JSON.stringify({ type: "error", message: "messageId not found" })
          );
          return;
        }
        const messagedata = await Message.findOne({
          where: { id: messageId, roomId: roomId },
        });
        if (!messagedata) {
          socket.send(
            JSON.stringify({ type: "error", message: "message not found" })
          );
          return;
        }
        if (Number(messagedata.authorId) !== authorId) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Only delete your message",
            })
          );
          return;
        }
        await Message.destroy({ where: { id: messageId, authorId: authorId } });
        const roomMember = await RoomMembers.findAll({ where: { roomId } });
        for (const member of roomMember) {
          const userId = member.senderId;
          const clientSocket = clients.get(userId);
          if (clientSocket && clientSocket.readyState == 1) {
            clientSocket.send(
              JSON.stringify({
                type: "delete",
                messageId,
                roomId,
                deleteby: authorId,
              })
            );
          }
        }
      } else if (type === "count") {
        const unseencount = await Message.findAll({
          attributes: ["roomId", [fn("COUNT", col("id")), "count"]],
          where: { seen: false, authorId: { [Op.ne]: authorId } },
          group: ["roomId"],
          raw: true,
        });
        socket.send(JSON.stringify({ type: "count", data: unseencount }));
      } else if (type === "unseen") {
        const unseenMessage = await Message.findAll({
          where: {
            roomId: roomId,
            authorId: { [Op.ne]: authorId },
            seen: false,
          },
          order: [["createdAt", "ASC"]],
        });
        const unseenMessageCount = unseenMessage.length;
        if (unseenMessage.length > 0) {
          socket.send(
            JSON.stringify({
              type: "unseenMessage",
              roomId,
              count: unseenMessageCount,
              messages: unseenMessage,
            })
          );
        }
      }
    } catch (err) {
      console.error("Error in message handler:", err);
      socket.send(JSON.stringify({ type: "error", message: "fail to chat" }));
    }
  });
  socket.on("close", () => {
    clients.delete(authorId);
    for (const [roomId, members] of rooms.entries()) {
      members.delete(authorId);
    }
  });
};
