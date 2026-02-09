const canvas = document.getElementById("diagram");
const ctx = canvas.getContext("2d");
const wrapper = canvas.parentElement;
const draggable = document.querySelector(".label.center");

let animationFrameId = null;

/**
 * Função de Debounce para evitar cálculos excessivos no redimensionamento
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Configuração do canvas com suporte a alta resolução (Retina/High DPI)
 */
function resizeCanvas() {
  // Obtém o fator de escala da tela (DPR)
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Ajusta o tamanho interno do canvas (buffer) multiplicado pelo DPR
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Mantém o tamanho visual do canvas via CSS
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  // Escala o contexto para que os desenhos acompanhem a resolução
  ctx.scale(dpr, dpr);

  // Redesenha imediatamente após o resize
  draw();
}

// Aplica o debounce de 150ms no evento de resize
window.addEventListener("resize", debounce(resizeCanvas, 150));

// Inicializa o canvas
resizeCanvas();

/**
 * Função para obter ponto de ancoragem dos elementos
 */
function getAnchor(el, position = "bottom") {
  if (!el) return { x: 0, y: 0 };
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

/**
 * Desenha as linhas do diagrama
 */
function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const centerLabel = document.querySelector(".label.center");
  const bottomLabels = document.querySelectorAll(".label:not(.center)");

  if (!centerLabel) return;
  const start = getAnchor(centerLabel, "bottom");

  bottomLabels.forEach((label) => {
    const end = getAnchor(label, "top");
    const curveStrength = Math.abs(end.x - start.x) * 0.5;

    // Gradiente para as linhas
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#2525ed'); // Adicionado azul no final para combinar com o tema

    ctx.strokeStyle = gradient;
    ctx.shadowBlur = 4; // Reduzido para melhor performance
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";

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

    // Limpa a sombra para não afetar outros desenhos
    ctx.shadowBlur = 0;
  });
}

// Lógica de interpolação suave (Lerp) para o movimento
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
const smoothness = 0.1;

// Inicializa posição do elemento arrastável
if (draggable) {
  const initRect = draggable.getBoundingClientRect();
  const initWrapperRect = wrapper.getBoundingClientRect();
  currentX = targetX = initRect.left - initWrapperRect.left;
  currentY = targetY = initRect.top - initWrapperRect.top;
}

/* Loop de animação*/
function animate() {
  if (draggable) {
    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;

    draggable.style.left = `${currentX}px`;
    draggable.style.top = `${currentY}px`;
  }

  draw();
  animationFrameId = requestAnimationFrame(animate);
}

animate();

// Eventos de Mouse
document.addEventListener("mousemove", (e) => {
  if (!draggable) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  const labelRect = draggable.getBoundingClientRect();

  let x = e.clientX - wrapperRect.left - labelRect.width / 2;
  let y = e.clientY - wrapperRect.top - labelRect.height / 2;

  // Limites do container
  x = Math.max(0, Math.min(x, wrapperRect.width - labelRect.width));
  y = Math.max(0, Math.min(y, wrapperRect.height - labelRect.height));

  targetX = x;
  targetY = y;
});

// Eventos de Touch
document.addEventListener("touchmove", (e) => {
  if (!draggable) return;
  const touch = e.touches[0];
  const wrapperRect = wrapper.getBoundingClientRect();
  const labelRect = draggable.getBoundingClientRect();

  let x = touch.clientX - wrapperRect.left - labelRect.width / 2;
  let y = touch.clientY - wrapperRect.top - labelRect.height / 2;

  x = Math.max(0, Math.min(x, wrapperRect.width - labelRect.width));
  y = Math.max(0, Math.min(y, wrapperRect.height - labelRect.height));

  targetX = x;
  targetY = y;
}, { passive: true });

