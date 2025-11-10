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
import { sockethandler } from "./utility/socket.js";
app.use(express.json());
app.use(i18n.init);
app.use(cors());
if (process.env.APP_ENV === "prod") {
  app.use("/", indexRoutes);
} else {
  app.use("/api", indexRoutes);
}
wss.on("connection", sockethandler);
server.listen(process.env.PORT, () => {
  console.log("server started",process.env.PORT);
});
