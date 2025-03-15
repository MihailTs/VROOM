import { io } from "socket.io-client";
import { Peer } from "peerjs";

const myPeer = new Peer();

const SERVER = import.meta.env.VITE_SIGNALING_SERVER;

const socket = io( SERVER, {
  reconnectionDelayMax: 10000,
});

const app = document.getElementById("app");

const cameras = new Map();

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  app.appendChild(video); // Append the video element properly
}

myPeer.on("open", () => {
  console.log(`Client id is ${myPeer.id}`);
  socket.emit("client join", myPeer.id);

  myPeer.on("call", (call) => {
    console.log(`Camera ${call.peer} connected!`);

    call.answer();

    call.on("stream", (stream) => {
      console.log(`Camera ${call.peer} started streaming!`);

      const videoTrack = stream.getVideoTracks()[0];
      const processor = new MediaStreamTrackProcessor({ track: videoTrack });

      const generator = new MediaStreamTrackGenerator({ kind: "video" });

      const delayedStream = new MediaStream([generator]);

      const camera = document.createElement("video");
      camera.muted = "muted";
      camera.srcObject = delayedStream;
      camera.autoplay = true;
      app.appendChild(camera);
      cameras.set(call.peer, camera);

      const frameBuffer = [];
      const delay = 1000; // Delay in milliseconds

      const writer = generator.writable.getWriter();

      processor.readable.pipeTo(
        new WritableStream({
          write(frame) {
            frameBuffer.push({ frame, timestamp: Date.now() });

            // Prevent buffer overflow
            if (frameBuffer.length > 300) {
              const oldFrame = frameBuffer.shift();
              oldFrame.frame.close(); // Free memory
            }
          },
        })
      );

      setInterval(async () => {
        const now = Date.now();
        while (frameBuffer.length && frameBuffer[0].timestamp < now - delay) {
          const delayedFrame = frameBuffer.shift().frame;
          await writer.write(delayedFrame);
        }
      }, 100);
    });

    call.on("close", () => {
      console.log(`Camera ${call.peer} closed!`);
      app.removeChild(cameras.get(call.peer));
      cameras.delete(call.peer);
    });

    call.on("error", (err) => {
      console.log(`Camera ${call.peer} errored: ${err.message}!`);
      app.removeChild(cameras.get(call.peer));
      cameras.delete(call.peer);
    });
  });
});
