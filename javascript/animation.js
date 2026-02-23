import anime from 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.es.js';

function waitForHeader() {
  return new Promise((resolve) => {
    const header = document.querySelector('#header-placeholder');
    if (header && header.querySelector('.logo_main_felipe')) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      const logo = document.querySelector('.logo_main_felipe');
      if (logo) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

waitForHeader().then(() => {
  const projectCards = document.querySelectorAll('[data-project]');

  projectCards.forEach(card => {
    const eyeSvg = card.querySelector('#eyeSvg');
    const mainEye = card.querySelector('#main_eye');

    if (!eyeSvg || !mainEye) return;

    card.addEventListener('mousemove', (e) => {
      const eyeRect = eyeSvg.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      const maxDistance = 10;

      const moveX = Math.cos(angle) * maxDistance;
      const moveY = Math.sin(angle) * maxDistance;

      anime({
        targets: mainEye,
        translateX: moveX,
        translateY: moveY,
        duration: 100,
        easing: 'easeOutQuad'
      });
    });

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

  const logo = document.querySelector('.logo_main_felipe');

  if (logo) {
    let currentRotation = 0;

    function getLogoCenter() {
      const rect = logo.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    function getAngle(mouseX, mouseY) {
      const center = getLogoCenter();
      const deltaX = mouseX - center.x;
      const deltaY = mouseY - center.y;

      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      angle = angle - 90;

      while (angle > 180) angle -= 360;
      while (angle < -180) angle += 360;
      return Math.max(-90, Math.min(90, angle));
    }

    function updateRotation() {
      const diff = currentRotation - parseFloat(logo.style.transform?.replace('rotate(', '').replace('deg)', '') || 0);

      if (Math.abs(diff) > 0.1) {
        const newRotation = parseFloat(logo.style.transform?.replace('rotate(', '').replace('deg)', '') || 0) + diff * 0.15;
        logo.style.transform = `rotate(${newRotation}deg)`;
      }

      requestAnimationFrame(updateRotation);
    }

    updateRotation();

    document.addEventListener('mousemove', (e) => {
      currentRotation = getAngle(e.clientX, e.clientY);
    });
  }
});

const canvas = document.getElementById("hero_canvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector('[data-hero]');

const img1 = new Image();
const img2 = new Image();
const img3 = new Image();

// ⚠️ CAMINHOS DAS SUAS IMAGENS
img1.src = "img/hands_blender.png";
img2.src = "img/mainframe.jpg";
img3.src = "img/banner_1.png";

const images = [img1, img2, img3];

let currentImageIndex = 0;
let imageTimer = null;
const IMAGE_DURATION = 800;

const cacheCanvas1 = document.createElement("canvas");
const cacheCtx1 = cacheCanvas1.getContext("2d");
const cacheCanvas2 = document.createElement("canvas");
const cacheCtx2 = cacheCanvas2.getContext("2d");

let textBounds = { x: 0, y: 0, width: 0, height: 0 };
let gridCells = [];

// Estado animado pelo GSAP
const anim = {
  revealRadius: 0,
  revealOpacity: 0,
  imageOpacity: 0,
};

// Opacidade por célula — GSAP vai animar cada índice
const cellOpacities = {};

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;
  updateTextCache();
  calculateGridCells();
}

window.addEventListener("resize", resize);

const text1 = "Por trás de uma interface";
const text2 = "existe um mundo de decisões 🌹";

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

function calculateGridCells() {
  gridCells = [];
  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = gridCells.length;
      gridCells.push({
        x: x * gridSizeX,
        y: y * gridSizeY,
        width: gridSizeX,
        height: gridSizeY
      });
      // Inicializa opacidade zerada por célula
      if (cellOpacities[index] === undefined) {
        cellOpacities[index] = 0;
      }
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

const maxRadius = 360;

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
const gridTransitionSpeed = 0.025;

window.addEventListener("scroll", () => {
  const step = 20;
  const max = 600;
  const steps = Math.floor(window.scrollY / 500);
  targetGridRadius = 40 + steps * step;
  if (targetGridRadius > max) targetGridRadius = max;
});

function drawGrid() {
  gridRadius += (targetGridRadius - gridRadius) * gridTransitionSpeed;

  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = Math.floor(canvas.height / baseSize);
  const gridSizeX = canvas.width / cols;
  const gridSizeY = canvas.height / rows;

  ctx.strokeStyle = "#181818";
  ctx.lineWidth = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      drawRoundedRect(x * gridSizeX, y * gridSizeY, gridSizeX, gridSizeY, gridRadius);
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

function drawImageInRect(img, x, y, w, h, radius, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;

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

  const imgAspect = img.width / img.height;
  const rectAspect = w / h;
  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspect > rectAspect) {
    drawHeight = h;
    drawWidth = h * imgAspect;
    offsetX = (w - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = w;
    drawHeight = w / imgAspect;
    offsetX = 0;
    offsetY = (h - drawHeight) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  ctx.restore();

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

const imagePositions = [0, 2, 7];

function startImageSequence() {
  currentImageIndex = 0;
  gsap.killTweensOf(anim, "imageOpacity");
  gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

  if (imageTimer) clearInterval(imageTimer);

  imageTimer = setInterval(() => {
    if (isMouseOverText() && mouse.active) {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        // Fade da nova imagem
        gsap.killTweensOf(anim, "imageOpacity");
        gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

        // Fade in da célula nova
        const cellIndex = imagePositions[currentImageIndex];
        gsap.to(cellOpacities, {
          [cellIndex]: 1,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    } else {
      clearInterval(imageTimer);
      imageTimer = null;
    }
  }, IMAGE_DURATION);

  // Fade in da primeira célula
  const firstCell = imagePositions[0];
  gsap.to(cellOpacities, {
    [firstCell]: 1,
    duration: 0.6,
    ease: "power2.out"
  });
}

function stopImageSequence() {
  if (imageTimer) {
    clearInterval(imageTimer);
    imageTimer = null;
  }

  // Fade out de todas as células ativas
  imagePositions.forEach(cellIndex => {
    gsap.to(cellOpacities, {
      [cellIndex]: 0,
      duration: 0.5,
      ease: "power2.inOut"
    });
  });

  currentImageIndex = 0;
}

let wasOverText = false;

function onEnterText() {
  // Reveal circle: entra com easing elástico suave
  gsap.killTweensOf(anim, "revealRadius,revealOpacity");
  gsap.to(anim, {
    revealRadius: maxRadius,
    duration: 0.6,
    ease: "expo.out"
  });
  gsap.to(anim, {
    revealOpacity: 1,
    duration: 0.35,
    ease: "power2.out"
  });

  startImageSequence();
}

function onLeaveText() {
  // Reveal circle: sai suavemente
  gsap.killTweensOf(anim, "revealRadius,revealOpacity");
  gsap.to(anim, {
    revealRadius: 0,
    duration: 0.5,
    ease: "power3.inOut"
  });
  gsap.to(anim, {
    revealOpacity: 0,
    duration: 0.3,
    ease: "power2.in"
  });

  stopImageSequence();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isOverText = isMouseOverText();
  const shouldReveal = isMobile
    ? (mouse.pressed && mouse.active && isOverText)
    : (mouse.active && isOverText);

  // Dispara callbacks de entrada/saída do texto
  if (isOverText && !wasOverText) onEnterText();
  else if (!isOverText && wasOverText) onLeaveText();
  wasOverText = isOverText;

  if (mouse.active && (isMobile ? mouse.pressed : true)) {

    const activeCells = new Set();
    imagePositions.forEach((cellIndex, posIndex) => {
      if (isOverText && posIndex <= currentImageIndex && images[posIndex].complete) {
        activeCells.add(cellIndex);
      }
    });

    gridCells.forEach((cell, index) => {
      const posIndex = imagePositions.indexOf(index);
      const cellOpacity = cellOpacities[index] || 0;

      // Grid some conforme imagem aparece
      ctx.save();
      ctx.globalAlpha = 1 - cellOpacity;
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 1;
      drawRoundedRect(cell.x, cell.y, cell.width, cell.height, gridRadius);
      ctx.restore();

      // Imagem entra com fade suave
      if (cellOpacity > 0.01 && posIndex !== -1 && images[posIndex] && images[posIndex].complete) {
        const baseOpacity = posIndex === currentImageIndex ? anim.imageOpacity : 1;
        drawImageInRect(
          images[posIndex],
          cell.x, cell.y,
          cell.width, cell.height,
          gridRadius,
          cellOpacity * baseOpacity
        );
      }
    });

    ctx.drawImage(cacheCanvas1, 0, 0);

    // Reveal circle
    if (anim.revealRadius > 1 && anim.revealOpacity > 0.01) {
      ctx.save();
      ctx.globalAlpha = anim.revealOpacity;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = anim.revealOpacity;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(cacheCanvas2, 0, 0);
      ctx.restore();

      const borderOpacity = Math.min(anim.revealRadius / 80, 1) * anim.revealOpacity;
      ctx.save();
      ctx.globalAlpha = borderOpacity;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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
  onLeaveText();
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
  onLeaveText();
});

canvas.addEventListener("touchcancel", () => {
  mouse.active = false;
  mouse.pressed = false;
  mouse.x = -999;
  mouse.y = -999;
  onLeaveText();
});

// const canvas = document.getElementById("hero_canvas");
// const ctx = canvas.getContext("2d");
// const hero = document.querySelector('[data-hero]');

// // =============================================
// // CONFIG — ajuste aqui sem mexer no resto
// // =============================================
// const CONFIG = {
//   cols: 2,
//   rows: 4,
//   gap: 12,
//   margin: 24,
//   radius: 16,
//   strokeColor: "#181818",
//   strokeWidth: 1,
// };

// // =============================================
// // IMAGENS — caminho e qual célula ocupa
// // =============================================
// const IMAGES = [
//   { src: "img/hands_blender.png", cellIndex: 0 },
//   { src: "img/mainframe.jpg",     cellIndex: 2 },
//   { src: "img/banner_1.png",      cellIndex: 5 },
// ];

// const loadedImages = IMAGES.map(({ src, cellIndex }) => {
//   const img = new Image();
//   img.src = src;
//   img.onload = draw;
//   return { img, cellIndex };
// });

// // =============================================
// // TEXTO — dois layers em cache canvas
// // =============================================
// const TEXT = {
//   line1: "Por trás de uma interface, existe um mundo de decisões...",
//   line2: "é esse cuidado que transforma design em experiência.🌹",
//   fontFamily: "Geologica",
//   color1: "#181818",
//   color2: "#000000",
// };

// const cacheCanvas1 = document.createElement("canvas");
// const cacheCtx1 = cacheCanvas1.getContext("2d");
// const cacheCanvas2 = document.createElement("canvas");
// const cacheCtx2 = cacheCanvas2.getContext("2d");

// let textBounds = { x: 0, y: 0, width: 0, height: 0 };

// // =============================================
// // ESTADO GSAP
// // =============================================
// const anim = {
//   revealRadius: 0,
//   revealOpacity: 0,
//   imageOpacity: 0,
//   gridOpacity: 1,   // para fade in do grid na entrada
// };

// const cellOpacities = {};

// // =============================================
// // CANVAS — resize responsivo
// // =============================================
// function resizeCanvas() {
//   canvas.width = hero.clientWidth;
//   canvas.height = hero.clientHeight;
//   updateTextCache();
// }

// window.addEventListener("resize", () => {
//   resizeCanvas();
//   draw();
// });

// resizeCanvas();

// // =============================================
// // TEXTO — cache e bounds
// // =============================================
// function getFontSize() {
//   return window.innerWidth >= 1024 ? 100 : 30;
// }

// function wrapText(context, text, maxWidth, fontSize) {
//   const words = text.split(' ');
//   const lines = [];
//   let currentLine = words[0];
//   context.font = `400 ${fontSize}px ${TEXT.fontFamily}`;
//   for (let i = 1; i < words.length; i++) {
//     const word = words[i];
//     const width = context.measureText(currentLine + " " + word).width;
//     if (width < maxWidth) {
//       currentLine += " " + word;
//     } else {
//       lines.push(currentLine);
//       currentLine = word;
//     }
//   }
//   lines.push(currentLine);
//   return lines;
// }

// function renderTextToCache(context, lines, color, fontSize) {
//   const lineHeight = fontSize;
//   const totalHeight = lines.length * lineHeight;
//   const startY = canvas.height / 2 - totalHeight / 2 + fontSize / 2;

//   context.font = `400 ${fontSize}px ${TEXT.fontFamily}`;
//   context.textAlign = "center";
//   context.textBaseline = "middle";
//   context.fillStyle = color;

//   lines.forEach((line, i) => {
//     context.fillText(line, canvas.width / 2, startY + i * lineHeight);
//   });
// }

// function updateTextCache() {
//   const fontSize = getFontSize();
//   const maxTextWidth = canvas.width * 0.9;

//   cacheCanvas1.width = canvas.width;
//   cacheCanvas1.height = canvas.height;
//   const lines1 = wrapText(cacheCtx1, TEXT.line1, maxTextWidth, fontSize);
//   renderTextToCache(cacheCtx1, lines1, TEXT.color1, fontSize);

//   cacheCanvas2.width = canvas.width;
//   cacheCanvas2.height = canvas.height;
//   const lines2 = wrapText(cacheCtx2, TEXT.line2, maxTextWidth, fontSize);
//   renderTextToCache(cacheCtx2, lines2, TEXT.color2, fontSize);

//   // Calcula bounds do texto para detectar hover
//   ctx.font = `400 ${fontSize}px ${TEXT.fontFamily}`;
//   const allLines = [...lines1, ...lines2];
//   let maxWidth = 0;
//   allLines.forEach(line => {
//     const w = ctx.measureText(line).width;
//     if (w > maxWidth) maxWidth = w;
//   });
//   const totalLines = Math.max(lines1.length, lines2.length);
//   const totalHeight = totalLines * fontSize;
//   textBounds = {
//     x: canvas.width / 2 - maxWidth / 2,
//     y: canvas.height / 2 - totalHeight / 2,
//     width: maxWidth,
//     height: totalHeight,
//   };
// }

// // =============================================
// // GRID — calcula posição e tamanho das células
// // =============================================
// function buildGrid() {
//   const { cols, rows, gap, margin } = CONFIG;
//   const totalW = canvas.width - margin * 2;
//   const totalH = canvas.height - margin * 2;
//   const cellW = (totalW - gap * (cols - 1)) / cols;
//   const cellH = (totalH - gap * (rows - 1)) / rows;

//   const cells = [];
//   for (let row = 0; row < rows; row++) {
//     for (let col = 0; col < cols; col++) {
//       const index = cells.length;
//       cells.push({
//         x: margin + col * (cellW + gap),
//         y: margin + row * (cellH + gap),
//         width: cellW,
//         height: cellH,
//       });
//       if (cellOpacities[index] === undefined) {
//         cellOpacities[index] = 0;
//       }
//     }
//   }
//   return cells;
// }

// // =============================================
// // DRAW HELPERS
// // =============================================
// function drawRoundedRect(x, y, w, h, r) {
//   ctx.beginPath();
//   ctx.moveTo(x + r, y);
//   ctx.lineTo(x + w - r, y);
//   ctx.quadraticCurveTo(x + w, y, x + w, y + r);
//   ctx.lineTo(x + w, y + h - r);
//   ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
//   ctx.lineTo(x + r, y + h);
//   ctx.quadraticCurveTo(x, y + h, x, y + h - r);
//   ctx.lineTo(x, y + r);
//   ctx.quadraticCurveTo(x, y, x + r, y);
//   ctx.closePath();
//   ctx.stroke();
// }

// function drawImageInCell(img, x, y, w, h, r, opacity = 1) {
//   ctx.save();
//   ctx.globalAlpha = opacity;

//   ctx.beginPath();
//   ctx.moveTo(x + r, y);
//   ctx.lineTo(x + w - r, y);
//   ctx.quadraticCurveTo(x + w, y, x + w, y + r);
//   ctx.lineTo(x + w, y + h - r);
//   ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
//   ctx.lineTo(x + r, y + h);
//   ctx.quadraticCurveTo(x, y + h, x, y + h - r);
//   ctx.lineTo(x, y + r);
//   ctx.quadraticCurveTo(x, y, x + r, y);
//   ctx.closePath();
//   ctx.clip();

//   const imgAspect = img.width / img.height;
//   const cellAspect = w / h;
//   let drawW, drawH, offsetX, offsetY;

//   if (imgAspect > cellAspect) {
//     drawH = h;
//     drawW = h * imgAspect;
//     offsetX = (w - drawW) / 2;
//     offsetY = 0;
//   } else {
//     drawW = w;
//     drawH = w / imgAspect;
//     offsetX = 0;
//     offsetY = (h - drawH) / 2;
//   }

//   ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
//   ctx.restore();

//   // Borda por cima da imagem
//   ctx.strokeStyle = CONFIG.strokeColor;
//   ctx.lineWidth = CONFIG.strokeWidth;
//   drawRoundedRect(x, y, w, h, r);
// }

// // =============================================
// // MOUSE / TOUCH
// // =============================================
// const isMobile = window.innerWidth <= 768;

// const mouse = {
//   x: -999,
//   y: -999,
//   active: false,
//   pressed: false,
// };

// function isMouseOverText() {
//   return (
//     mouse.x >= textBounds.x &&
//     mouse.x <= textBounds.x + textBounds.width &&
//     mouse.y >= textBounds.y &&
//     mouse.y <= textBounds.y + textBounds.height
//   );
// }

// function updatePointerPosition(x, y) {
//   const rect = canvas.getBoundingClientRect();
//   mouse.x = x - rect.left;
//   mouse.y = y - rect.top;
//   mouse.active = true;
// }

// canvas.addEventListener("mousemove", (e) => updatePointerPosition(e.clientX, e.clientY));
// canvas.addEventListener("mouseleave", () => {
//   mouse.active = false;
//   mouse.x = -999;
//   mouse.y = -999;
//   onLeaveText();
// });

// canvas.addEventListener("touchstart", (e) => {
//   const touch = e.touches[0];
//   updatePointerPosition(touch.clientX, touch.clientY);
//   mouse.pressed = true;
// });
// canvas.addEventListener("touchmove", (e) => {
//   const touch = e.touches[0];
//   updatePointerPosition(touch.clientX, touch.clientY);
// });
// canvas.addEventListener("touchend", () => {
//   mouse.active = false;
//   mouse.pressed = false;
//   mouse.x = -999;
//   mouse.y = -999;
//   onLeaveText();
// });
// canvas.addEventListener("touchcancel", () => {
//   mouse.active = false;
//   mouse.pressed = false;
//   mouse.x = -999;
//   mouse.y = -999;
//   onLeaveText();
// });

// // =============================================
// // SEQUÊNCIA DE IMAGENS
// // =============================================
// let currentImageIndex = 0;
// let imageTimer = null;
// const IMAGE_DURATION = 800;
// const imageCellIndexes = IMAGES.map(item => item.cellIndex); // [0, 2, 5]

// function startImageSequence() {
//   currentImageIndex = 0;

//   gsap.killTweensOf(anim, "imageOpacity");
//   gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

//   // Fade in da primeira célula
//   gsap.to(cellOpacities, {
//     [imageCellIndexes[0]]: 1,
//     duration: 0.6,
//     ease: "power2.out",
//   });

//   if (imageTimer) clearInterval(imageTimer);

//   imageTimer = setInterval(() => {
//     if (isMouseOverText() && mouse.active) {
//       if (currentImageIndex < loadedImages.length - 1) {
//         currentImageIndex++;

//         gsap.killTweensOf(anim, "imageOpacity");
//         gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

//         gsap.to(cellOpacities, {
//           [imageCellIndexes[currentImageIndex]]: 1,
//           duration: 0.6,
//           ease: "power2.out",
//         });
//       }
//     } else {
//       clearInterval(imageTimer);
//       imageTimer = null;
//     }
//   }, IMAGE_DURATION);
// }

// function stopImageSequence() {
//   if (imageTimer) {
//     clearInterval(imageTimer);
//     imageTimer = null;
//   }
//   imageCellIndexes.forEach(cellIndex => {
//     gsap.to(cellOpacities, {
//       [cellIndex]: 0,
//       duration: 0.5,
//       ease: "power2.inOut",
//     });
//   });
//   currentImageIndex = 0;
// }

// // =============================================
// // REVEAL CIRCLE — enter / leave
// // =============================================
// const maxRadius = 360;
// let wasOverText = false;

// function onEnterText() {
//   gsap.killTweensOf(anim, "revealRadius,revealOpacity");
//   gsap.to(anim, { revealRadius: maxRadius, duration: 0.6, ease: "expo.out" });
//   gsap.to(anim, { revealOpacity: 1, duration: 0.35, ease: "power2.out" });
//   startImageSequence();
// }

// function onLeaveText() {
//   gsap.killTweensOf(anim, "revealRadius,revealOpacity");
//   gsap.to(anim, { revealRadius: 0, duration: 0.5, ease: "power3.inOut" });
//   gsap.to(anim, { revealOpacity: 0, duration: 0.3, ease: "power2.in" });
//   stopImageSequence();
// }

// // =============================================
// // ANIMAÇÃO DE ENTRADA — GSAP ao carregar
// // =============================================
// function playIntroAnimation() {
//   const cells = buildGrid();

//   // Grid entra célula por célula em cascata (stagger)
//   gsap.fromTo(
//     anim,
//     { gridOpacity: 0 },
//     {
//       gridOpacity: 1,
//       duration: 0.8,
//       ease: "power2.out",
//       delay: 0.2,
//     }
//   );

//   // Texto entra depois do grid
//   gsap.fromTo(
//     cacheCanvas1,
//     { opacity: 0 },
//     { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.7 }
//   );
// }

// // =============================================
// // DRAW PRINCIPAL
// // =============================================
// function draw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   const cells = buildGrid();
//   const isOverText = isMouseOverText();
//   const shouldReveal = isMobile
//     ? (mouse.pressed && mouse.active && isOverText)
//     : (mouse.active && isOverText);

//   if (isOverText && !wasOverText) onEnterText();
//   else if (!isOverText && wasOverText) onLeaveText();
//   wasOverText = isOverText;

//   // Mapa rápido cellIndex → imagem
//   const imageMap = {};
//   loadedImages.forEach(({ img, cellIndex }) => {
//     if (img.complete && img.naturalWidth > 0) imageMap[cellIndex] = img;
//   });

//   // Desenha células
//   cells.forEach((cell, index) => {
//     const cellOpacity = cellOpacities[index] || 0;

//     // Grid some conforme imagem aparece
//     ctx.save();
//     ctx.globalAlpha = (1 - cellOpacity) * anim.gridOpacity;
//     ctx.strokeStyle = CONFIG.strokeColor;
//     ctx.lineWidth = CONFIG.strokeWidth;
//     drawRoundedRect(cell.x, cell.y, cell.width, cell.height, CONFIG.radius);
//     ctx.restore();

//     // Imagem entra com fade suave
//     if (cellOpacity > 0.01 && imageMap[index]) {
//       const isCurrentImage = imageCellIndexes.indexOf(index) === currentImageIndex;
//       const baseOpacity = isCurrentImage ? anim.imageOpacity : 1;
//       drawImageInCell(imageMap[index], cell.x, cell.y, cell.width, cell.height, CONFIG.radius, cellOpacity * baseOpacity);
//     }
//   });

//   // Texto layer 1
//   ctx.save();
//   ctx.globalAlpha = anim.gridOpacity; // entra junto com o grid
//   ctx.drawImage(cacheCanvas1, 0, 0);
//   ctx.restore();

//   // Reveal circle (hover no texto)
//   if (anim.revealRadius > 1 && anim.revealOpacity > 0.01) {
//     ctx.save();
//     ctx.globalAlpha = anim.revealOpacity;
//     ctx.globalCompositeOperation = "destination-out";
//     ctx.beginPath();
//     ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.restore();

//     ctx.save();
//     ctx.globalAlpha = anim.revealOpacity;
//     ctx.beginPath();
//     ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
//     ctx.clip();
//     ctx.drawImage(cacheCanvas2, 0, 0);
//     ctx.restore();

//     // Borda do círculo
//     const borderOpacity = Math.min(anim.revealRadius / 80, 1) * anim.revealOpacity;
//     ctx.save();
//     ctx.globalAlpha = borderOpacity;
//     ctx.lineWidth = 2;
//     ctx.strokeStyle = "#000000";
//     ctx.beginPath();
//     ctx.arc(mouse.x, mouse.y, anim.revealRadius, 0, Math.PI * 2);
//     ctx.stroke();
//     ctx.restore();
//   }

//   requestAnimationFrame(draw);
// }

// // =============================================
// // INIT
// // =============================================
// playIntroAnimation();
// draw();