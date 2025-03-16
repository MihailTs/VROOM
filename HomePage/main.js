const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create geometry and material
const geometry = new THREE.SphereGeometry(2, 30, 30); // increase the sphere size
const texture = new THREE.TextureLoader().load("mars_texture.jpg"); // load Mars texture

const material = new THREE.MeshStandardMaterial({
  map: texture,
});

// Create the sphere with the new material
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Light
const light = new THREE.AmbientLight(0x404040, 30);
scene.add(light);

camera.position.z = 5;

// Particle background (stars)
const starsGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const positions = [];
for (let i = 0; i < starCount; i++) {
  positions.push((Math.random() - 0.5) * 100);
  positions.push((Math.random() - 0.5) * 100);
  positions.push((Math.random() - 0.5) * 100);
}
starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Raycaster and cursor scene
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Cursor logic
let mouseX = window.innerWidth / 2,
  mouseY = window.innerHeight / 2; // Cursor starts at the center
let outerX = mouseX,
  outerY = mouseY; // Current position of outer diamond
const parallaxOffset = 15; // Strength of parallax effect
const smoothness = 0.1; // Smoothness factor
const elasticity = 0.2; // Elastic effect strength (how far it stretches beyond boundaries)

const cursorOuter = document.querySelector(".cursor-outer");
const cursorInner = document.querySelector(".cursor-inner");
const text = document.querySelector(".text");
const boundary = document.querySelector(".boundary");

// Boundary area
const boundaryRect = boundary.getBoundingClientRect();
const boundaryCenterX = boundaryRect.left + boundaryRect.width / 2;
const boundaryCenterY = boundaryRect.top + boundaryRect.height / 2;
const boundaryRadius = boundaryRect.width / 2;

function applyElasticEffect(x, y) {
  const dx = x - boundaryCenterX;
  const dy = y - boundaryCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If outside the circle — pull cursor toward center
  if (distance > boundaryRadius) {
    return { x: boundaryCenterX, y: boundaryCenterY };
  }

  return { x, y };
}

// Cursor animation function
function animateCursor() {
  // Apply elastic effect
  const elasticPos = applyElasticEffect(mouseX, mouseY);
  const elasticX = elasticPos.x;
  const elasticY = elasticPos.y;

  // Smooth follow of outer diamond
  outerX += (elasticX - outerX) * smoothness;
  outerY += (elasticY - outerY) * smoothness;

  // Parallax effect
  const offsetX = (elasticX - window.innerWidth / 2) / parallaxOffset;
  const offsetY = (elasticY - window.innerHeight / 2) / parallaxOffset;

  cursorOuter.style.left = `${
    outerX - cursorOuter.offsetWidth / 2 + offsetX
  }px`;
  cursorOuter.style.top = `${
    outerY - cursorOuter.offsetHeight / 2 + offsetY
  }px`;

  // Inner diamond follows the mouse exactly
  cursorInner.style.left = `${elasticX - cursorInner.offsetWidth / 2}px`;
  cursorInner.style.top = `${elasticY - cursorInner.offsetHeight / 2}px`;

  // Text follows the mouse exactly
  text.style.left = `${elasticX}px`;
  text.style.top = `${elasticY}px`;
}

// Listen to mouse movement
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Convert mouse coordinates for Three.js
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Cursor intersection check
function checkCursor() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "auto";
  }
}

// Click → zoom effect on sphere
let zoomed = false;
document.addEventListener("click", () => {
  if (zoomed) return;
  zoomed = true;
  gsap.to(camera.position, {
    z: 0.5,
    duration: 2,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.to(camera.position, { z: 5, duration: 1, delay: 1 });
      setTimeout(() => {
        window.location.assign("/camera-client");
      }, 550);
    },
  });
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Cursor animation
  animateCursor();

  // Three.js scene animation
  sphere.rotation.y += 0.003;
  checkCursor(); // Check cursor interaction
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
