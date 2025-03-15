import { io } from "socket.io-client";
import { Peer } from "peerjs";

const myPeer = new Peer();

const SERVER = import.meta.env.VITE_SIGNALING_SERVER;

const socket = io(SERVER, {
  reconnectionDelayMax: 10000,
});

myPeer.on("open", () => {
  console.log("Camera App Peer ID:", myPeer.id);

  socket.emit("camera join", myPeer.id);

  socket.on("camera", (clientId) => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false
      })
      .then((localStream) => {
        const call = myPeer.call(clientId, localStream);

        window.addEventListener("beforeunload", (event) => {
          event.preventDefault();
          call.close();
        });

        console.log("Connected to ", clientId);

        call.on("close", () => {
          console.log("Call closed");
        });

        call.on("error", (err) => {
          console.log("Call error:", err.message);
        });
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
      });
  });

  socket.on("camera broadcast", (clientId) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((localStream) => {
        const call = myPeer.call(clientId, localStream);
        console.log("Connected to ", clientId);

        call.on("close", () => {
          console.log("Call closed");
        });

        call.on("error", (err) => {
          console.log("Call error:", err.message);
        });
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
      });
  });
});
