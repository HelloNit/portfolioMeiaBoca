const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".heroSection");

// Canvases de cache para evitar cálculos repetitivos de texto
const cacheCanvas1 = document.createElement("canvas");
const cacheCtx1 = cacheCanvas1.getContext("2d");
const cacheCanvas2 = document.createElement("canvas");
const cacheCtx2 = cacheCanvas2.getContext("2d");

let textBounds = { x: 0, y: 0, width: 0, height: 0 };

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;

  // Atualiza o cache sempre que a tela mudar de tamanho
  updateTextCache();
}

window.addEventListener("resize", resize);

const text1 = "Por trás de uma interface, existe um mundo de decisões...";
const text2 = "é esse cuidado que transforma design em experiência☁️.";

const fontSize = 120;
const fontFamily = "Geologica";
const lineHeight = fontSize * 1;

const centerX = () => canvas.width / 2;
const centerY = () => canvas.height / 2;

function wrapText(context, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  context.font = `400 ${fontSize}px ${fontFamily}`;

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function updateTextCache() {
  const maxTextWidth = canvas.width * 0.9;

  // Prepara o cache para o Texto 1
  cacheCanvas1.width = canvas.width;
  cacheCanvas1.height = canvas.height;
  const lines1 = wrapText(cacheCtx1, text1, maxTextWidth);
  renderTextToCache(cacheCtx1, lines1, "#000000");

  // Prepara o cache para o Texto 2
  cacheCanvas2.width = canvas.width;
  cacheCanvas2.height = canvas.height;
  const lines2 = wrapText(cacheCtx2, text2, maxTextWidth);
  renderTextToCache(cacheCtx2, lines2, "#0a2cff");

  // Calcula os limites do texto para detecção de colisão do mouse
  calculateTextBounds(lines1, lines2);
}

function renderTextToCache(context, lines, color) {
  const totalHeight = lines.length * lineHeight;
  let startY = centerY() - totalHeight / 2 + fontSize / 2;

  context.font = `100 ${fontSize}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;

  lines.forEach((line, i) => {
    context.fillText(line, centerX(), startY + i * lineHeight);
  });
}

function calculateTextBounds(lines1, lines2) {
  const allLines = [...lines1, ...lines2];
  let maxWidth = 0;

  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  allLines.forEach(line => {
    const width = ctx.measureText(line).width;
    if (width > maxWidth) maxWidth = width;
  });

  const totalLines = Math.max(lines1.length, lines2.length);
  const totalHeight = totalLines * lineHeight;

  textBounds = {
    x: centerX() - maxWidth / 2,
    y: centerY() - totalHeight / 2,
    width: maxWidth,
    height: totalHeight
  };
}

// Inicializa o primeiro resize e cache
resize();

const mouse = {
  x: -999,
  y: -999,
  active: false
};

let revealRadius = 500;
let targetRadius = 500;
const minRadius = 40;
const maxRadius = 660;
const transitionSpeed = 0.10;

function isMouseOverText() {
  return (
    mouse.x >= textBounds.x &&
    mouse.x <= textBounds.x + textBounds.width &&
    mouse.y >= textBounds.y &&
    mouse.y <= textBounds.y + textBounds.height
  );
}

let gridRadius = 80;
let targetGridRadius = 130;
const gridTransitionSpeed = 0.04;

window.addEventListener("scroll", () => {
  const step = 40;
  const max = 600;
  const steps = Math.floor(window.scrollY / 100);
  targetGridRadius = 90 + steps * step;
  if (targetGridRadius > max) targetGridRadius = max;
});

function drawGrid() {
  const baseSize = 80;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  gridRadius += (targetGridRadius - gridRadius) * gridTransitionSpeed;
  const radius = gridRadius;

  ctx.strokeStyle = "#00000013";
  ctx.lineWidth = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      drawRoundedRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY, radius);
    }
  }
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  if (mouse.active && isMouseOverText()) {
    targetRadius = maxRadius;
  } else {
    targetRadius = minRadius;
  }

  revealRadius += (targetRadius - revealRadius) * transitionSpeed;

  if (mouse.active) {
    // Desenha o Texto 1 (Preto) a partir do cache
    ctx.drawImage(cacheCanvas1, 0, 0);

    // Efeito de revelação (Texto 2 Azul)
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.clip();
    // Desenha o Texto 2 (Azul) a partir do cache
    ctx.drawImage(cacheCanvas2, 0, 0);
    ctx.restore();

    // Stroke do mouse
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#0a2cff";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Desenha apenas o Texto 1 (Preto) a partir do cache
    ctx.drawImage(cacheCanvas1, 0, 0);
  }

  requestAnimationFrame(draw);
}

draw();

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener("mouseleave", () => {
  mouse.active = false;
  mouse.x = -999;
  mouse.y = -999;
});