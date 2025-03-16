import express from "express";
import https from "https";
import fs from "fs";
import { Server } from "socket.io";
import cors from "cors";

const options = {
  key: fs.readFileSync("certs/private-key.pem"),
  cert: fs.readFileSync("certs/certificate.pem"),
};

const app = express();

if (process.env.NODE_ENV === 'production'){
  app.use("/camera", express.static("camera"))
  app.use("/camera-client", express.static("camera-client"))
  app.use("/landing-page", express.static("landing-page"))
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
