/* =========================
   SETUP
========================= */
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".heroSection");

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;
}
window.addEventListener("resize", resize);
resize();

/* =========================
   TEXT CONFIG
========================= */
const text1 = "Por trás de uma interface, existe um mundo de decisões...";
const text2 = "é esse cuidado que transforma design em experiência🌹";

const fontSize = 150;
const fontFamily = "Geologica";
const lineHeight = fontSize * 1;

const centerX = () => canvas.width / 2;
const centerY = () => canvas.height / 2;

/* =========================
   TEXT WRAPPING
========================= */
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  ctx.font = `200 ${fontSize}px ${fontFamily}`;

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
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

/* =========================
   MOUSE
========================= */
const mouse = {
  x: -999,
  y: -999,
  active: false
};

let revealRadius = 200;
let targetRadius = 200;
const minRadius = 10;
const maxRadius = 400;
const transitionSpeed = 0.10;

/* =========================
   TEXT BOUNDS (hover)
========================= */
function getTextBounds() {
  ctx.font = `800 ${fontSize}px ${fontFamily}`;

  const maxTextWidth = canvas.width * 0.9;
  const lines1 = wrapText(text1, maxTextWidth);
  const lines2 = wrapText(text2, maxTextWidth);

  const allLines = [...lines1, ...lines2];
  let maxWidth = 0;

  allLines.forEach(line => {
    const width = ctx.measureText(line).width;
    if (width > maxWidth) maxWidth = width;
  });

  const totalLines = Math.max(lines1.length, lines2.length);
  const totalHeight = totalLines * lineHeight;

  return {
    x: centerX() - maxWidth / 2,
    y: centerY() - totalHeight / 2,
    width: maxWidth,
    height: totalHeight
  };
}

function isMouseOverText() {
  const bounds = getTextBounds();
  return (
    mouse.x >= bounds.x &&
    mouse.x <= bounds.x + bounds.width &&
    mouse.y >= bounds.y &&
    mouse.y <= bounds.y + bounds.height
  );
}

/* =========================
   DRAW TEXT WITH WRAPPING
========================= */
function drawText(text, color) {
  const maxTextWidth = canvas.width * 0.9;
  const lines = wrapText(text, maxTextWidth);

  const totalHeight = lines.length * lineHeight;
  let startY = centerY() - totalHeight / 2 + fontSize / 2;

  ctx.fillStyle = color;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX(), startY + i * lineHeight);
  });
}

/* =========================
   SCROLL CONTROL (GRID RADIUS)
========================= */
let gridRadius = 80;
let targetGridRadius = 130;
const gridTransitionSpeed = 0.04; // <--- suavidade (quanto menor, mais suave)

window.addEventListener("scroll", () => {
  const step = 40;
  const max = 600;

  const steps = Math.floor(window.scrollY / 100);
  targetGridRadius = 90 + steps * step;

  if (targetGridRadius > max) targetGridRadius = max;
});

/* =========================
   GRID
========================= */
function drawGrid() {
  // gridSize "base"
  const baseSize = 90;

  // Quantidade de colunas e linhas que cabem
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);

  // Ajusta o tamanho do grid para caber certinho
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  // interpolação suave do radius
  gridRadius += (targetGridRadius - gridRadius) * gridTransitionSpeed;
  const radius = gridRadius;

  ctx.strokeStyle = "#00000018";
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

/* =========================
   DRAW
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar grid
  drawGrid();

  // Atualizar raio do reveal (transição suave)
  if (mouse.active && isMouseOverText()) {
    targetRadius = maxRadius;
  } else {
    targetRadius = minRadius;
  }

  // Interpolação suave
  revealRadius += (targetRadius - revealRadius) * transitionSpeed;

  // Configurar fonte
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (mouse.active) {
    // Desenhar texto 1 (preto)
    drawText(text1, "#000");

    // Criar máscara circular para "apagar" o texto preto
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Desenhar texto 2 (azul) apenas no círculo
    ctx.save();
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.clip();

    drawText(text2, "#0a2cff");
    ctx.restore();

    // Desenhar borda vermelha do círculo
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.stroke();

  } else {
    // Apenas texto preto quando mouse não está ativo
    drawText(text1, "#000");
  }

  requestAnimationFrame(draw);
}

draw();

/* =========================
   EVENTS
========================= */
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
