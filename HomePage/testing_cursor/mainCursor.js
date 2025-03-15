let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2; // Курсорът започва в центъра
let outerX = mouseX, outerY = mouseY; // Текущи координати на външния ромб
const parallaxOffset = 15; // Сила на паралакс ефекта
const smoothness = 0.1; // Коефициент на плавност
const elasticity = 0.2; // Сила на ластичния ефект (колко да се "разтяга" извън границите)

const cursorOuter = document.querySelector('.cursor-outer');
const cursorInner = document.querySelector('.cursor-inner');
const text = document.querySelector('.text');
const boundary = document.querySelector('.boundary');

// Граници на областта
const boundaryRect = boundary.getBoundingClientRect();
const boundaryCenterX = boundaryRect.left + boundaryRect.width / 2;
const boundaryCenterY = boundaryRect.top + boundaryRect.height / 2;
const boundaryRadius = boundaryRect.width / 2; // Радиус на кръга

// Функция за ластичен ефект
// function applyElasticEffect(x, y) {
//     const dx = x - boundaryCenterX;
//     const dy = y - boundaryCenterY;
//     const distance = Math.sqrt(dx * dx + dy * dy);

//     // Ако курсорът е извън кръга, го връщаме обратно с ластичен ефект
//     if (distance > boundaryRadius) {
//         const overflow = distance - boundaryRadius;
//         const angle = Math.atan2(dy, dx);
//         x = boundaryCenterX + Math.cos(angle) * (boundaryRadius + overflow * elasticity);
//         y = boundaryCenterY + Math.sin(angle) * (boundaryRadius + overflow * elasticity);
//     }

//     return { x, y };
// }

function applyElasticEffect(x, y) {
    const dx = x - boundaryCenterX;
    const dy = y - boundaryCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Ако е извън кръга — насочваме курсора към центъра
    if (distance > boundaryRadius) {
        return { x: boundaryCenterX, y: boundaryCenterY };
    }

    return { x, y };
}


// Функция за анимация с requestAnimationFrame
function animate() {
    // Прилагаме ластичен ефект
    const elasticPos = applyElasticEffect(mouseX, mouseY);
    const elasticX = elasticPos.x;
    const elasticY = elasticPos.y;

    // Плавно следене на външния ромб
    outerX += (elasticX - outerX) * smoothness;
    outerY += (elasticY - outerY) * smoothness;

    // Паралакс ефект
    const offsetX = (elasticX - window.innerWidth / 2) / parallaxOffset;
    const offsetY = (elasticY - window.innerHeight / 2) / parallaxOffset;

    cursorOuter.style.left = `${outerX - cursorOuter.offsetWidth / 2 + offsetX}px`;
    cursorOuter.style.top = `${outerY - cursorOuter.offsetHeight / 2 + offsetY}px`;

    // Вътрешният ромб следва мишката точно
    cursorInner.style.left = `${elasticX - cursorInner.offsetWidth / 2}px`;
    cursorInner.style.top = `${elasticY - cursorInner.offsetHeight / 2}px`;

    // Текстът следва мишката точно
    text.style.left = `${elasticX}px`;
    text.style.top = `${elasticY}px`;

    requestAnimationFrame(animate);
}

// Слушаме за движение на мишката
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Стартираме анимацията
animate();