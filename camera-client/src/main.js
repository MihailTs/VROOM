import { io } from "socket.io-client";
import { Peer } from "peerjs";
import "./style.css"

const delay = 5000; // Delay in milliseconds
const myPeer = new Peer();

const SERVER = import.meta.env.VITE_SIGNALING_SERVER;

const socket = io(SERVER, {
  reconnectionDelayMax: 10000,
});

const app = document.getElementById("app");

const cameras = new Map();

function createCameraDisplay(peerId, delayedStream) {
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper"

  const videoContainer = document.createElement("div")
  videoContainer.className = "videoContainer"
  const camera = document.createElement("video");
  videoContainer.appendChild(camera)

  camera.muted = "muted";
  camera.srcObject = delayedStream;
  camera.autoplay = true;
  camera.height = 400;
  camera.style.position = "relative";
  wrapper.appendChild(videoContainer);

  const overlay = document.createElement("div");
  overlay.className = "overlay"

  setTimeout(() => {
    wrapper.append(overlay);
  }, delay);

  app.appendChild(wrapper);
  cameras.set(peerId, wrapper);
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

      createCameraDisplay(call.peer, delayedStream);

      const frameBuffer = [];

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


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const starsGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const positions = [];
for (let i = 0; i < starCount; i++) {
  positions.push((Math.random() - 0.5) * 100);
  positions.push((Math.random() - 0.5) * 100);
  positions.push((Math.random() - 0.5) * 100);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
