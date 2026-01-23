const canvas = document.getElementById("diagram");
const ctx = canvas.getContext("2d");
const wrapper = canvas.parentElement;
const draggable = document.querySelector(".label.center");

let animationFrameId = null;

// Configuração do canvas com suporte a alta resolução
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  ctx.scale(dpr, dpr);
  draw();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Função para obter ponto de ancoragem
function getAnchor(el, position = "bottom") {
  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  if (position === "bottom") {
    return {
      x: rect.left + rect.width / 2 - wrapperRect.left,
      y: rect.bottom - wrapperRect.top
    };
  }

  if (position === "top") {
    return {
      x: rect.left + rect.width / 2 - wrapperRect.left,
      y: rect.top - wrapperRect.top
    };
  }
}

// Desenha as linhas com gradiente e suavização
function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const centerLabel = document.querySelector(".label.center");
  const bottomLabels = document.querySelectorAll(".label:not(.center)");
  const start = getAnchor(centerLabel, "bottom");

  bottomLabels.forEach((label, index) => {
    const end = getAnchor(label, "top");
    const curveStrength = Math.abs(end.x - start.x) * 0.5;
    
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, '#000000');


    ctx.strokeStyle = gradient;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y + 8);
    ctx.bezierCurveTo(
      start.x,
      start.y + curveStrength,
      end.x,
      end.y - curveStrength,
      end.x,
      end.y - 2
    );
    ctx.stroke();

    // Remove sombra após desenhar
    ctx.shadowBlur = 0;
  });
}

// Posição atual e alvo para interpolação suave
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
const smoothness = 0.15; // Quanto menor, mais suave (0.1 - 0.3)

// Inicializa posição
const initRect = draggable.getBoundingClientRect();
const initWrapperRect = wrapper.getBoundingClientRect();
currentX = targetX = initRect.left - initWrapperRect.left;
currentY = targetY = initRect.top - initWrapperRect.top;

// Animação contínua para movimento suave
function animate() {
  // Interpolação suave (lerp)
  currentX += (targetX - currentX) * smoothness;
  currentY += (targetY - currentY) * smoothness;

  // Aplica posição
  draggable.style.left = `${currentX}px`;
  draggable.style.top = `${currentY}px`;

  draw();
  requestAnimationFrame(animate);
}

animate();

// Seguir mouse
document.addEventListener("mousemove", (e) => {
  const wrapperRect = wrapper.getBoundingClientRect();
  const labelRect = draggable.getBoundingClientRect();

  // Calcula posição alvo (centralizado no mouse)
  let x = e.clientX - wrapperRect.left - labelRect.width / 2;
  let y = e.clientY - wrapperRect.top - labelRect.height / 2;

  // Limites com padding
  const padding = 0;
  x = Math.max(padding, Math.min(x, wrapperRect.width - labelRect.width - padding));
  y = Math.max(padding, Math.min(y, wrapperRect.height - labelRect.height - padding));

  targetX = x;
  targetY = y;
});

// Suporte para touch em dispositivos móveis
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const wrapperRect = wrapper.getBoundingClientRect();
  const labelRect = draggable.getBoundingClientRect();

  let x = touch.clientX - wrapperRect.left - labelRect.width / 2;
  let y = touch.clientY - wrapperRect.top - labelRect.height / 2;

  const padding = 10;
  x = Math.max(padding, Math.min(x, wrapperRect.width - labelRect.width - padding));
  y = Math.max(padding, Math.min(y, wrapperRect.height - labelRect.height - padding));

  targetX = x;
  targetY = y;
});