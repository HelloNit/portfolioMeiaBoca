import anime from 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.es.js';

document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.style.display = 'flex';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                lightbox.classList.add('active');

                anime({
                    targets: '#lightbox-img',
                    opacity: [0, 1],
                    scale: [0.92, 1],
                    duration: 600,
                    easing: 'cubicBezier(0.77, 0, 0.18, 1)',
                });

                anime({
                    targets: '.lightbox_icon_fill',
                    opacity: [0, 1],
                    translateY: [8, 0],
                    duration: 500,
                    delay: 600,
                    easing: 'cubicBezier(0.77, 0, 0.18, 1)',
                });
            });
        });
    }

    // duplo clique nas imagens
    document.querySelectorAll('.zoom_img_desktop').forEach(img => {
        let clicks = 0;
        let timer = null;
        img.style.cursor = 'url("/img/cursor.png"), auto';

        img.addEventListener('click', () => {
            clicks++;
            clearTimeout(timer);
            timer = setTimeout(() => { clicks = 0; }, 400);

            if (clicks === 2) {
                clicks = 0;
                openLightbox(img.src);
            }
        });
    });

    // botão zoom do slider
    const zoomBtn = document.querySelector('.zoom_img');
    if (zoomBtn) {
        zoomBtn.addEventListener('click', () => {
            const activeSlide = document.querySelector('.slider_item.active');
            if (!activeSlide) return;
            const img = activeSlide.querySelector('img');
            if (!img) return;
            openLightbox(img.src);
        });
    }

    // fechar lightbox
    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.src = '';
        }, 400);
    });
});

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

const anim = {
  revealRadius: 0,
  revealOpacity: 0,
  imageOpacity: 0,
};

const cellOpacities = {};

// Retorna true se estiver em mobile — reavaliado a cada chamada
const isMobile = () => window.innerWidth <= 768;

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;
  updateTextCache();
  calculateGridCells();
}

window.addEventListener("resize", resize);

const text1 = "Por trás de uma interface";
const text2 = "existe um mundo de decisões.";

const fontFamily = "Geologica";

let fontSize = window.innerWidth >= 1024 ? 100 : 30;
let lineHeight = fontSize * 2;

const centerX = () => canvas.width / 2;
const centerY = () => canvas.height / 1.8;

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

  if (canvas.width < 768) return;

  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = 2; 
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
      if (cellOpacities[index] === undefined) {
        cellOpacities[index] = 0;
      }
    }
  }
}

resize();

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
  if (canvas.width < 768) return;

  gridRadius += (targetGridRadius - gridRadius) * gridTransitionSpeed;

  const baseSize = 300;
  const cols = Math.floor(canvas.width / baseSize);
  const rows = 2; // sempre 2 rows
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

// Índices das células do grid onde as imagens aparecem
const imageCellIndices = [0, 1, 7];

function startImageSequence() {
  currentImageIndex = 0;
  gsap.killTweensOf(anim, "imageOpacity");
  gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

  if (imageTimer) clearInterval(imageTimer);

  imageTimer = setInterval(() => {
    if (isMouseOverText() && mouse.active) {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        gsap.killTweensOf(anim, "imageOpacity");
        gsap.fromTo(anim, { imageOpacity: 0 }, { imageOpacity: 1, duration: 0.5, ease: "power2.out" });

        const cellIndex = imageCellIndices[currentImageIndex];
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

  const firstCell = imageCellIndices[0];
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

  imageCellIndices.forEach(cellIndex => {
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

// Reseta mouse e dispara onLeaveText — usado em múltiplos listeners
function resetMouse() {
  mouse.active = false;
  mouse.pressed = false;
  mouse.x = -999;
  mouse.y = -999;
  onLeaveText();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isOverText = isMouseOverText();
  const shouldReveal = isMobile()
    ? (mouse.pressed && mouse.active && isOverText)
    : (mouse.active && isOverText);

  if (isOverText && !wasOverText) onEnterText();
  else if (!isOverText && wasOverText) onLeaveText();
  wasOverText = isOverText;

  if (mouse.active && (isMobile() ? mouse.pressed : true)) {

    gridCells.forEach((cell, index) => {
      const posIndex = imageCellIndices.indexOf(index);
      const cellOpacity = cellOpacities[index] || 0;

      ctx.save();
      ctx.globalAlpha = 1 - cellOpacity;
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 1;
      drawRoundedRect(cell.x, cell.y, cell.width, cell.height, gridRadius);
      ctx.restore();

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

canvas.addEventListener("mouseleave", resetMouse);

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  updatePointerPosition(touch.clientX, touch.clientY);
  mouse.pressed = true;
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  updatePointerPosition(touch.clientX, touch.clientY);
});

canvas.addEventListener("touchend", resetMouse);
canvas.addEventListener("touchcancel", resetMouse);

// Efeito de scroll no hero mobile
function initScrollEffect() {
  const ghostText = document.querySelector('.hero_ghost_text');
  const mainText = document.querySelector('.hero_main_text');
  if (!ghostText || !mainText) return;

  const lenis = new Lenis();

  lenis.on('scroll', ({ scroll }) => {
    const maxScroll = 100;
    const progress = Math.min(scroll / maxScroll, 1);

    const mainOpacity = 1 - progress * 0.9;
    mainText.style.color = `rgba(0, 0, 0, ${mainOpacity})`;

    const ghostOpacity = 0.04 + progress * 0.96;
    ghostText.style.color = `rgba(0, 0, 0, ${ghostOpacity})`;
    ghostText.style.zIndex = progress > 0.05 ? '1' : '-1';
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

initScrollEffect();