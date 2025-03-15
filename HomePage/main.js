const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Създаване на геометрия и материал
const geometry = new THREE.SphereGeometry(1.5, 30, 30); // увеличаваме размера на сферата
const texture = new THREE.TextureLoader().load('2k_mars.jpg'); // зареждаме текстурата на Марс

const material = new THREE.MeshStandardMaterial({
  map: texture, // прилагаме текстурата
});

// Създаване на сфера с новия материал
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Светлина
const light = new THREE.AmbientLight(0x404040, 15); 
scene.add(light);

camera.position.z = 5;

// Партикулен фон (звезди)
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

// Raycaster и сцена на курсора
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// // Слушаме за движение на мишката
// document.addEventListener('mousemove', (event) => {
//   // Преобразуваме координатите на мишката в нормализирани координати на сцена (-1 до 1)
//   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
// });

const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});


// Проверка за пресичане с курсора
function checkCursor() {
  // Уверяваме се, че камерата е правилно инициализирана
  raycaster.setFromCamera(mouse, camera);  

  // Преглеждаме за пресичане със сферата
  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    // Курсорът е върху сферата
    document.body.style.cursor = 'pointer';  // Променяме курсора
  } else {
    // Курсорът не е върху сферата
    document.body.style.cursor = 'auto';  // Връщаме обикновения курсор
  }
}

// parallax effect
// document.addEventListener('mousemove', (e) => {
//   const x = (e.clientX / window.innerWidth - 0.5) * 2;
//   const y = -(e.clientY / window.innerHeight - 0.5) * 2;
//   gsap.to(camera.rotation, { x: y * 0.1, y: x * 0.1, duration: 0.5 });
// });

// Клик → zoom ефект към сферата
let zoomed = false;
document.addEventListener('click', () => {
  if (zoomed) return;
  zoomed = true;
  gsap.to(camera.position, {
    z: 0.5,
    duration: 2,
    ease: "power2.inOut",
    onComplete: () => {
      // може да се смени сцена, фон и т.н.
      gsap.to(camera.position, { z: 5, duration: 1, delay: 1 });
    }
  });
});

// Анимация
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.y += 0.005;
  checkCursor();  // Проверяваме за курсора
  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});