import express from "express";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import cors from "cors";
import { env } from "process";

const options = {
  key: fs.readFileSync("certs/private-key.pem"),
  cert: fs.readFileSync("certs/certificate.pem"),
};

const app = express();

if (process.env.NODE_ENV === 'production'){
  app.use(express.static("camera", "camera"))
  app.use(express.static("camera-client", "camera-client"))
}

app.use(cors());

const server = https.createServer(options, app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let client = null;

io.on("connection", (socket) => {
  socket.on("camera join", (cameraId) => {
    console.log("[camera joined]", cameraId);
    console.log(client);

    if (client !== null) {
      socket.emit("camera", client)
    }
  });
  socket.on("client join", (clientId) => {
    console.log("[client join]", clientId);
    client = clientId;
    console.log("camera broadcast");
    socket.broadcast.emit("camera broadcast", client);
  });
});

server.listen(3000, () => console.log("server is running"));
