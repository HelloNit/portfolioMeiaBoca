const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".heroSection");

function resize() {
  canvas.width = hero.clientWidth;
  canvas.height = hero.clientHeight;
}
window.addEventListener("resize", resize);
resize();


const text1 = "Por trás de uma interface, existe um mundo de decisões...";
const text2 = "é esse cuidado que transforma design em experiência.";

const fontSize = 120;
const fontFamily = "Geologica";
const lineHeight = fontSize * 1;

const centerX = () => canvas.width / 2;
const centerY = () => canvas.height / 2;

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  ctx.font = `400 ${fontSize}px ${fontFamily}`;

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
  //tamanho do grid
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


  ctx.font = `100 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (mouse.active) {
    drawText(text1, "#000000");

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

    drawText(text2, "#0a2cff");
    ctx.restore();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#0a2cff"; // cor do stroke do mouse

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, revealRadius, 0, Math.PI * 2);
    ctx.stroke();


  } else {
    drawText(text1, "#000000");

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
