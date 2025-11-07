import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
const app = express();
import i18n from "./config/il8n.js";
import dotenv from "dotenv";
import indexRoutes from "./routes/index.js";
import * as path from "path";
dotenv.config();
import { fileURLToPath } from "url";
import { datafilter } from "./controller/dashboard.js";
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from "cors";
import db from "../src/models/index.js";
import { decodeToken } from "./utility/jwt.js";
const { Message, Rooms, RoomMembers, Users } = db;
app.use(express.json());
app.use(i18n.init);
app.use(cors());
if (process.env.APP_ENV === "prod") {
  app.use("/", indexRoutes);
} else {
  app.use("/api", indexRoutes);
}
// const clients = new Map();
// const rooms = new Map();
// wss.on("connection",  (socket) => {
//   socket.on("message", async (data) => {
//     try {
//       const msg = JSON.parse(data);
//       console.log(msg);
//       if (msg.type === "join") {
//         clients.set(msg.userId, socket);
//         socket.send(JSON.stringify({ type: "join", userId: msg.userId }));
//       } else if (msg.type === "message") {
//         const receiverSocket = clients.get(msg.to);
//         if (receiverSocket) {
//           await Chat.create({
//                  from:msg.from,
//                  to:msg.to,
//                  chat:msg.text
//           })
//           receiverSocket.send(
//             JSON.stringify({
//               from: msg.from,
//               text: msg.text,
//             })
//           );
//         } else {
//           socket.send(
//             JSON.stringify({
//               type: "error",
//               message: `User ${msg.to}not connected`,
//             })
//           );
//         }
//       }
//     } catch (err) {
//       console.log(err)
//       socket.send(
//         JSON.stringify({ type: "error", message: "fail to chat" })
//       );
//     }
//   });
//   socket.on("close", () => {
//     for (const [userId, s] of clients.entries()) {
//       if (s === socket) {
//         clients.delete(userId);
//         break;
//       }
//     }
//   });
//});

app.post("/createRoom", async (req, res) => {
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
});

app.post("/addMember", async (req, res) => {
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
});
app.get("/history/:id", async (req, res) => {
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
});
const clients = new Map();
const rooms = new Map();
wss.on("connection", (socket, req) => {
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
      const { type, roomId, text } = msg;
      if (!type || !roomId || !authorId) {
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
        await Message.create({ roomId, authorId, text });
        await Rooms.update({ text }, { where: { id: roomId } });
        const roomMembers = await RoomMembers.findAll({ where: { roomId } });
        for (const roomMember of roomMembers) {
          const userId = roomMember.senderId;
          const clientSocket = clients.get(userId);
          if (clientSocket && clientSocket.readyState === 1) {
            clientSocket.send(
              JSON.stringify({ type: "message", roomId, authorId, text })
            );
          }
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
});
server.listen(process.env.PORT, () => {
  console.log("server started");
});
