import { animate } from 'https://cdn.jsdelivr.net/npm/animejs/+esm';

const projectCards = document.querySelectorAll('[data-project]');

projectCards.forEach(card => {
  const eyeSvg = card.querySelector('#eyeSvg');
  const mainEye = card.querySelector('#main_eye');

  if (!eyeSvg || !mainEye) return;

  card.addEventListener('mousemove', (e) => {
    // Pega a posição do SVG na página
    const eyeRect = eyeSvg.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Calcula o ângulo entre o centro do olho e o mouse
    const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);

    // Define o raio máximo de movimento (ajuste conforme necessário)
    const maxDistance = 10;

    // Calcula a nova posição X e Y
    const moveX = Math.cos(angle) * maxDistance;
    const moveY = Math.sin(angle) * maxDistance;

    // Anima o olho usando Anime.js
    anime({
      targets: mainEye,
      translateX: moveX,
      translateY: moveY,
      duration: 100,
      easing: 'easeOutQuad'
    });
  });

  // Quando o mouse sai do card, retorna o olho ao centro
  card.addEventListener('mouseleave', () => {
    anime({
      targets: mainEye,
      translateX: 0,
      translateY: 0,
      duration: 700,
      easing: 'easeOutElastic(1, .6)'
    });
  });
});

const canvas = document.getElementById("hero_canvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector('[data-hero]');

// Cria e carrega as 3 imagens (escondidas no DOM)
const img1 = new Image();
const img2 = new Image();
const img3 = new Image();

// ⚠️ CAMINHOS DAS SUAS IMAGENS
img1.src = "img/hands_blender.png";
img2.src = "img/mainframe.jpg";
img3.src = "img/banner_1.png";

const images = [img1, img2, img3];

// Controle de sequência das imagens
let currentImageIndex = 0;
let imageTimer = null;
let lastMouseOverTime = 0;
const IMAGE_DURATION = 500;
let imageOpacity = 0;
let isFadingIn = false;

const cacheCanvas1 = document.createElement("canvas");
const cacheCtx1 = cacheCanvas1.getContext("2d");
const cacheCanvas2 = document.createElement("canvas");
const cacheCtx2 = cacheCanvas2.getContext("2d");

let textBounds = { x: 0, y: 0, width: 0, height: 0 };
let gridCells = [];

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;
  updateTextCache();
  calculateGridCells();
}

window.addEventListener("resize", resize);

const text1 = "Por trás de uma interface, existe um mundo de decisões...";
const text2 = "é esse cuidado que transforma design em experiência.🌹";

const fontFamily = "Geologica";

let fontSize = window.innerWidth >= 1024 ? 100 : 30;
let lineHeight = fontSize * 1;

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
  fontSize = window.innerWidth >= 1024 ? 100 : 30;
  lineHeight = fontSize * 1;

  const maxTextWidth = canvas.width * 0.9;

  cacheCanvas1.width = canvas.width;
  cacheCanvas1.height = canvas.height;
  const lines1 = wrapText(cacheCtx1, text1, maxTextWidth);
  renderTextToCache(cacheCtx1, lines1, "#181818");

  cacheCanvas2.width = canvas.width;
  cacheCanvas2.height = canvas.height;
  const lines2 = wrapText(cacheCtx2, text2, maxTextWidth);
  renderTextToCache(cacheCtx2, lines2, "#000000");

  calculateTextBounds(lines1, lines2);
}

function renderTextToCache(context, lines, color) {
  const totalHeight = lines.length * lineHeight;
  let startY = centerY() - totalHeight / 2 + fontSize / 2;

  context.font = `400 ${fontSize}px ${fontFamily}`;
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

// Calcula as posições de todos os retângulos da grid
function calculateGridCells() {
  gridCells = [];
  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      gridCells.push({
        x: x * gridSizeX,
        y: y * gridSizeY,
        width: gridSizeX,
        height: gridSizeY
      });
    }
  }
}

resize();

const isMobile = window.innerWidth <= 768;

const mouse = {
  x: -999,
  y: -999,
  active: false,
  pressed: false
};

let revealRadius = 500;
let targetRadius = 500;
const minRadius = 10;
const maxRadius = 360;
const transitionSpeed = 0.10;

function isMouseOverText() {
  return (
    mouse.x >= textBounds.x &&
    mouse.x <= textBounds.x + textBounds.width &&
    mouse.y >= textBounds.y &&
    mouse.y <= textBounds.y + textBounds.height
  );
}

let gridRadius = 40;
let targetGridRadius = 60;
const gridTransitionSpeed = 0.04;

window.addEventListener("scroll", () => {
  const step = 20;
  const max = 600;
  const steps = Math.floor(window.scrollY / 500);
  targetGridRadius = 40 + steps * step;
  if (targetGridRadius > max) targetGridRadius = max;
});

function drawGrid() {
  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  gridRadius += (targetGridRadius - gridRadius) * gridTransitionSpeed;
  const radius = gridRadius;

  ctx.strokeStyle = "#181818";
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

// Desenha uma imagem ajustada ao retângulo com cantos arredondados
function drawImageInRect(img, x, y, w, h, radius, opacity = 1) {
  ctx.save();

  // Define a opacidade
  ctx.globalAlpha = opacity;

  // Cria o clipping path com cantos arredondados
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  // Desenha a imagem cobrindo todo o retângulo (com object-fit: cover)
  const imgAspect = img.width / img.height;
  const rectAspect = w / h;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspect > rectAspect) {
    // Imagem mais larga que o retângulo
    drawHeight = h;
    drawWidth = h * imgAspect;
    offsetX = (w - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Imagem mais alta que o retângulo
    drawWidth = w;
    drawHeight = w / imgAspect;
    offsetX = 0;
    offsetY = (h - drawHeight) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);

  ctx.restore();

  // Desenha a borda
  ctx.strokeStyle = "#181818";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.stroke();
}

// Gerencia a sequência de imagens
function startImageSequence() {
  currentImageIndex = 0;
  imageOpacity = 0;
  isFadingIn = true;
  lastMouseOverTime = Date.now();

  // Limpa timer anterior se existir
  if (imageTimer) {
    clearInterval(imageTimer);
  }

  // Avança para próxima imagem a cada 3 segundos
  imageTimer = setInterval(() => {
    if (isMouseOverText() && mouse.active) {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        imageOpacity = 0;
        isFadingIn = true;
      }
    } else {
      clearInterval(imageTimer);
      imageTimer = null;
    }
  }, IMAGE_DURATION);
}

function stopImageSequence() {
  if (imageTimer) {
    clearInterval(imageTimer);
    imageTimer = null;
  }
  currentImageIndex = 0;
}

// Variável para controlar estado anterior do mouse
let wasOverText = false;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const shouldReveal = isMobile
    ? (mouse.pressed && mouse.active && isMouseOverText())
    : (mouse.active && isMouseOverText());

  // Detecta quando o mouse entra sobre o texto
  const isOverText = isMouseOverText();
  if (isOverText && !wasOverText) {
    startImageSequence();
  } else if (!isOverText && wasOverText) {
    stopImageSequence();
  }
  wasOverText = isOverText;

  if (shouldReveal) {
    targetRadius = maxRadius;
  } else {
    targetRadius = minRadius;
  }

  revealRadius += (targetRadius - revealRadius) * transitionSpeed;

  // Atualiza fade in
  if (isFadingIn && imageOpacity < 1) {
    imageOpacity += 0.05; // Velocidade do fade
    if (imageOpacity >= 1) {
      imageOpacity = 1;
      isFadingIn = false;
    }
  }

  if (mouse.active && (isMobile ? mouse.pressed : true)) {
    // Posições específicas para as imagens
    const imagePositions = [0, 2, 7];

    // Desenha a grid com imagens nos retângulos
    gridCells.forEach((cell, index) => {
      // Verifica se é uma das posições escolhidas (0, 2, 6)
      const posIndex = imagePositions.indexOf(index);

      if (posIndex !== -1 && isOverText && posIndex <= currentImageIndex && images[posIndex].complete) {
        // Desenha a imagem com fade in apenas para a imagem atual
        const opacity = posIndex === currentImageIndex ? imageOpacity : 1;
        drawImageInRect(
          images[posIndex],
          cell.x,
          cell.y,
          cell.width,
          cell.height,
          gridRadius,
          opacity
        );
      } else {
        // Desenha retângulo vazio
        ctx.strokeStyle = "#00000015";
        ctx.lineWidth = 1;
        drawRoundedRect(cell.x, cell.y, cell.width, cell.height, gridRadius);
      }
    });

    // Desenha o texto por cima
    ctx.drawImage(cacheCanvas1, 0, 0);

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
    ctx.drawImage(cacheCanvas2, 0, 0);
    ctx.restore();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    drawGrid();
    ctx.drawImage(cacheCanvas1, 0, 0);
  }

  requestAnimationFrame(draw);
}

draw();

function updatePointerPosition(x, y) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = x - rect.left;
  mouse.y = y - rect.top;
  mouse.active = true;
}

canvas.addEventListener("mousemove", (e) => {
  updatePointerPosition(e.clientX, e.clientY);
});

canvas.addEventListener("mouseleave", () => {
  mouse.active = false;
  mouse.x = -999;
  mouse.y = -999;
  stopImageSequence();
});

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  updatePointerPosition(touch.clientX, touch.clientY);
  mouse.pressed = true;
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  updatePointerPosition(touch.clientX, touch.clientY);
});

canvas.addEventListener("touchend", () => {
  mouse.active = false;
  mouse.pressed = false;
  mouse.x = -999;
  mouse.y = -999;
  stopImageSequence();
});

canvas.addEventListener("touchcancel", () => {
  mouse.active = false;
  mouse.pressed = false;
  mouse.x = -999;
  mouse.y = -999;
  stopImageSequence();
});

// Teste simples

