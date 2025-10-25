// scrolltrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", async () => {
  carregarFooter();
  animarConteudo();
  animarScrollHorizontal();
  previewImage();
  
  // Inicializar animação dos comentários após um delay
  setTimeout(() => {
    initCommentsAnimation();
    ScrollTrigger.refresh();
  }, 300);
});

// footer
function carregarFooter() {
  const footer = document.getElementById("footerElement");

  if (!footer) {
    console.error("Elemento #footerElement não encontrado!");
    return Promise.resolve();
  }

  const isInPartials = location.pathname.includes("/partials/");
  const footerPath = isInPartials ? "footer.html" : "partials/footer.html";

  return fetch(footerPath)
    .then(res => res.ok ? res.text() : Promise.reject(res))
    .then(html => {
      footer.innerHTML = html;
    })
    .catch(() => {
      const alternativePath = isInPartials ? "../footer.html" : "./partials/footer.html";
      return fetch(alternativePath)
        .then(res => res.ok ? res.text() : Promise.reject(res))
        .then(html => {
          footer.innerHTML = html;
        })
        .catch(() => {
          footer.innerHTML = '<p>Footer não pôde ser carregado</p>';
        });
    });
}

// animação scrolling
function animarConteudo() {
  const handoffDiagram = document.getElementById('handoffDiagram');
  if (!handoffDiagram) {
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#handoffDiagram',
      start: 'top 100%',
      toggleActions: 'play none none none',
    }
  });

  tl.from('#headingMain', {
    opacity: 0,
    filter: 'blur(10px)',
    duration: 1.2,
    ease: 'power2.out'
  });

  ['lineVector', 'lineVector_1', 'lineVector_6', 'lineVector_7', 'lineVector_8', 'lineVector_9', 'lineVector_10'].forEach(id => {
    tl.from(`#${id}`, {
      y: -60,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3');
  });

  [
    { subtitle: 'subtitle', lvLeft: 'lineVector_2', lvRight: 'lineVector_4' },
    { subtitle: 'subtitle_1', lvLeft: 'lineVector_3', lvRight: 'lineVector_5' },
  ].forEach(({ subtitle, lvLeft, lvRight }) => {
    tl.from(`#${subtitle}`, {
      opacity: 0,
      filter: 'blur(10px)',
      duration: 1.2,
      ease: 'power2.out'
    }, '-=0.6');

    tl.from(`#${lvLeft}`, {
      x: -100,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.8');

    tl.from(`#${lvRight}`, {
      x: 100,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6');
  });

  ['subtitle_2', 'subtitle_3', 'subtitle_4', 'subtitle_5'].forEach(id => {
    tl.from(`#${id}`, {
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.4');
  });

  tl.from([
    '#text', '#text_1', '#text_2', '#text_3', '#text_4',
    '#text_5', '#text_6', '#text_7', '#text_8', '#text_9',
    '#text_10', '#text_11', '#text_12'
  ], {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.5');
}

// scroll horizontal (projetos)
function animarScrollHorizontal() {
  const container = document.querySelector(".scrollWrapper");
  const horizontalScroll = document.querySelector(".scrollLeftRight");
  if (!container || !horizontalScroll) return;

  gsap.to(horizontalScroll, {
    x: () => `-${horizontalScroll.scrollWidth - container.offsetWidth}`,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: () => `+=${horizontalScroll.scrollWidth - container.offsetWidth}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true // recalcula no resize
    }
  });
}

// preview do próximo projeto (metade i.a metade minha esquizofrenia no código) 
function previewImage() {
  const links = document.querySelectorAll('.btnSeeProject');
  links.forEach(link => {
    const preview = link.querySelector('.previewImage');

    link.addEventListener('mouseenter', () => {
      preview.style.visibility = 'visible';
      preview.style.opacity = '1';
    });

    link.addEventListener('mouseleave', () => {
      preview.style.visibility = 'hidden';
      preview.style.opacity = '0';
    });

    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();

      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.min(x, rect.width - preview.offsetWidth / 2);
      y = Math.min(y, rect.height - preview.offsetHeight / 2);
      x = Math.max(x, preview.offsetWidth / 2);
      y = Math.max(y, preview.offsetHeight / 2);

      preview.style.left = (x - preview.offsetWidth / 2) + 'px';
      preview.style.top = (y - preview.offsetHeight / 2) + 'px';
    });
  });
}

//Menu mobile
const closePath1 = "M2 8C5.33349 8 7.91964 13.5 10.5 13.5C13.0894 13.5 15.6729 8 19 8";
const closePath2 = "M2 12C5.33349 12 7.91964 8 10.5 8C13.0894 8 15.6729 12 19 12";

let isOpen = false;

const lineTwo = document.getElementById("lineTwo");
const lineTwo_2 = document.getElementById("lineTwo_2");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

if (menuToggle && mobileNav && lineTwo && lineTwo_2) {
  menuToggle.addEventListener("click", () => {
    isOpen = !isOpen;

    // Animação do botão
    gsap.to(lineTwo, {
      duration: 0.4,
      morphSVG: isOpen ? closePath1 : "M2 8C8.67863 8 12.3575 8 19 8",
      ease: "power2.inOut"
    });

    gsap.to(lineTwo_2, {
      duration: 0.4,
      morphSVG: isOpen ? closePath2 : "M2 12C8.67863 12 12.3575 12 19 12",
      ease: "power2.inOut"
    });

    // Animação do menu
    if (isOpen) {
      gsap.set(mobileNav, { display: "flex" });
      gsap.to(mobileNav, { opacity: 1, duration: 0.4, ease: "power2.out" });
    } else {
      gsap.to(mobileNav, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => mobileNav.style.display = "none"
      });
    }
  });
}

// swaper
class HeroImageSwapper {
  constructor(waveEffect) {
    this.titleUp = document.querySelector('.titleUp');
    this.titleDown = document.querySelector('.titleDown');
    this.uiImages = document.querySelectorAll('.swapUI');
    this.uxImages = document.querySelectorAll('.swapUX');

    this.currentUIIndex = 0;
    this.currentUXIndex = 0;
    this.swapInterval = null;
    this.isSwapping = false;

    this.waveEffect = waveEffect;

    this.init();
  }

  init() {
    this.titleUp.addEventListener('mouseenter', () => {
      this.startSwapping('ux');
      this.waveEffect.startWave();
    });
    this.titleUp.addEventListener('mouseleave', () => {
      this.stopSwapping('ux');
      this.waveEffect.stopWave();
    });
    this.titleUp.addEventListener('mousemove', (e) => {
      this.handleMouseMove('ux');
      this.waveEffect.updateMouseFromElement(e, this.titleUp);
    });

    this.titleDown.addEventListener('mouseenter', () => {
      this.startSwapping('ui');
      this.waveEffect.startWave();
    });
    this.titleDown.addEventListener('mouseleave', () => {
      this.stopSwapping('ui');
      this.waveEffect.stopWave();
    });
    this.titleDown.addEventListener('mousemove', (e) => {
      this.handleMouseMove('ui');
      this.waveEffect.updateMouseFromElement(e, this.titleDown);
    });
  }

  startSwapping(type) {
    if (this.isSwapping) return;
    this.isSwapping = true;

    if (type === 'ux') {
      this.hideAllImages(this.uiImages);
      this.hideAllImages(this.uxImages);
      this.currentUXIndex = 0;
      this.showImage(this.uxImages[0]);
    } else {
      this.hideAllImages(this.uxImages);
      this.hideAllImages(this.uiImages);
      this.currentUIIndex = 0;
      this.showImage(this.uiImages[0]);
    }

    this.swapInterval = setInterval(() => {
      if (type === 'ux') this.swapUXImages();
      else this.swapUIImages();
    }, 400);
  }

  stopSwapping(type) {
    this.isSwapping = false;
    clearInterval(this.swapInterval);

    if (type === 'ux') {
      this.hideAllImages(this.uxImages);
      this.showImage(this.uiImages[0]);
    } else {
      this.hideAllImages(this.uiImages);
      this.showImage(this.uiImages[0]);
    }
  }

  handleMouseMove(type) {
    if (this.isSwapping && Math.random() > 0.09) {
      if (type === 'ux') this.swapUXImages();
      else this.swapUIImages();
    }
  }

  swapUIImages() {
    this.hideAllImages(this.uiImages);
    this.currentUIIndex = (this.currentUIIndex + 1) % this.uiImages.length;
    this.showImage(this.uiImages[this.currentUIIndex]);
  }

  swapUXImages() {
    this.hideAllImages(this.uxImages);
    this.currentUXIndex = (this.currentUXIndex + 1) % this.uxImages.length;
    this.showImage(this.uxImages[this.currentUXIndex]);
  }

  hideAllImages(images) {
    images.forEach(img => img.classList.remove('active'));
  }

  showImage(image) {
    image.classList.add('active');
  }
}

// efeito wave
class OriginalSVGWaveEffect {
  constructor() {
    this.svg = document.getElementById('linewave');
    this.path = this.svg.querySelector('path');

    this.width = 1820;
    this.height = 1;
    this.centerY = 40;

    this.numPoints = 9999;
    this.maxAmplitude = 0;      // começa suave
    this.targetAmplitude = 80;  // valor final
    this.influenceRadius = 1820;
    this.magneticStrength = 0;  // começa suave
    this.targetMagnetic = 0;    // valor final

    this.mouseX = 0;
    this.mouseY = 0;
    this.isHovering = false;

    this.points = [];
    this.init();
  }

  init() {
    this.createPoints();
    this.startAnimation();
  }

  createPoints() {
    this.points = [];
    for (let i = 0; i <= this.numPoints; i++) {
      const x = 1.00101 + (i / this.numPoints) * (1143 - 1.00101);
      this.points.push({ x, y: this.centerY, targetY: this.centerY, originalY: this.centerY, velocity: 0 });
    }
  }

  startWave() {
    this.isHovering = true;

    // stroke animado
    gsap.to(this.path, { strokeWidth: 1, duration: 0.9, ease: "power2.out" });

    // entrada suave da onda
    gsap.to(this, {
      maxAmplitude: this.targetAmplitude,
      magneticStrength: this.targetMagnetic,
      duration: 10,
      ease: "power2.out"
    });
  }

  stopWave() {
    this.isHovering = false;

    // stroke volta suave
    gsap.to(this.path, { strokeWidth: 1, duration: 0.9, ease: "power2.out" });

    // suaviza saída da onda
    gsap.to(this, {
      maxAmplitude: 0,
      magneticStrength: 0,
      duration: 10,
      ease: "power2.out"
    });
  }

  updateMouseFromElement(e, element) {
    const rect = element.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width) * this.width;
    this.mouseY = ((e.clientY - rect.top) / rect.height) * this.height;
  }

  calculateWaveInfluence(point, time) {
    if (!this.isHovering) return 0;

    const distanceFromMouse = Math.abs(point.x - this.mouseX);
    const falloff = Math.exp(-distanceFromMouse / (this.influenceRadius * 0.9));
    const magneticY = (this.mouseY - point.originalY) * this.magneticStrength * falloff;

    const primary = Math.sin(time * 0.012 + point.x * 0.025) * falloff;
    const secondary = Math.sin(time * 0.018 + point.x * 0.04) * 0.6 * falloff;
    const tertiary = Math.sin(time * 0.008 + point.x * 0.02) * 0.4 * falloff;

    return magneticY + (primary + secondary + tertiary) * this.maxAmplitude * 0.8;
  }

  updatePoints() {
    const time = Date.now();
    this.points.forEach(p => {
      const influence = this.calculateWaveInfluence(p, time);
      p.targetY = p.originalY + influence;
      const spring = (p.targetY - p.y) * 0.25;
      p.velocity += spring;
      p.velocity *= 0.82;
      p.y += p.velocity;
    });
  }

  returnSmoothly() {
    this.points.forEach(p => {
      const spring = (p.originalY - p.y) * 0.08;
      p.velocity += spring;
      p.velocity *= 0.9;
      p.y += p.velocity;
    });
  }

  generatePath() {
    let path = `M ${this.points[0].x} ${this.points[0].y}`;
    for (let i = 1; i < this.points.length - 1; i++) {
      const c = this.points[i], n = this.points[i + 1];
      const cpX = c.x + (n.x - c.x) * 0.5;
      const cpY = c.y;
      path += ` Q ${cpX} ${cpY} ${n.x} ${n.y}`;
    }
    return path;
  }

  startAnimation() {
    const animate = () => {
      if (this.isHovering) {
        this.updatePoints();
      } else {
        this.returnSmoothly();
      }
      this.path.setAttribute('d', this.generatePath());
      requestAnimationFrame(animate);
    };
    animate();
  }
}

//animação wave
document.addEventListener('DOMContentLoaded', () => {
  const waveEffect = new OriginalSVGWaveEffect();
  new HeroImageSwapper(waveEffect);
});

const mobileBreakpoints = [575.98, 767.99, 992]; //resolução das telas

// se tá no mobile ou n
function isMobile() {
  return mobileBreakpoints.some(bp => window.innerWidth <= bp);
}

// Só inicializa o mosaico se não for mobile
if (!isMobile()) {

  const figmaIcon = document.querySelector(".figma");
  const blenderIcon = document.querySelector(".blender");
  const pixelGrid = document.querySelector(".pixelGrid");

  const cols = 15;
  const rows = 15;

  const tools = {
    blender: [
      { url: 'img/room_light_blender_modeling_study.png' },
      { url: 'img/hands_blender.png' },
      { url: 'img/blender_mic.png' },
      { url: 'img/blender_other.png' },
      { url: 'img/blender_pbr.png' },
    ],
    figma: [
      { url: '/img/figma_components.png' },
      { url: '/img/figma_simulation.png' },
      { url: '/img/figma_variables.png' }
    ]
  };

  let currentImage = 0;
  let intervalMosaic;

  // criação de grids
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let cell = document.createElement("div");
      cell.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
      cell.style.backgroundPosition = `${(c * 100) / (cols - 1)}% ${(r * 100) / (rows - 1)}%`;
      pixelGrid.appendChild(cell);
    }
  }

  function showMosaic(imgObj) {
    gsap.killTweensOf(pixelGrid.children);
    gsap.set(pixelGrid.children, { backgroundImage: `url(${imgObj.url})` });
    gsap.set(pixelGrid, { opacity: 1 });
    gsap.fromTo(
      pixelGrid.children,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.12,
        stagger: { each: 0.006, from: "random" },
        ease: "power1.out"
      }
    );
  }

  function hideMosaic() {
    gsap.killTweensOf(pixelGrid.children);
    gsap.to(pixelGrid.children, {
      opacity: 0,
      duration: 0.12,
      stagger: { each: 0.006, from: "random" },
      ease: "power1.in"
    });
  }

  function startSlideshow(toolArray) {
    currentImage = 0;
    clearInterval(intervalMosaic);
    showMosaic(toolArray[currentImage]);
    intervalMosaic = setInterval(() => {
      currentImage = (currentImage + 1) % toolArray.length;
      showMosaic(toolArray[currentImage]);
    }, 2500);
  }

  // Eventos
  blenderIcon.addEventListener("mouseenter", () => startSlideshow(tools.blender));
  blenderIcon.addEventListener("mouseleave", () => {
    clearInterval(intervalMosaic);
    hideMosaic();
  });

  figmaIcon.addEventListener("mouseenter", () => startSlideshow(tools.figma));
  figmaIcon.addEventListener("mouseleave", () => {
    clearInterval(intervalMosaic);
    hideMosaic();
  });

}

// Animação parallax icones my tools
const floatingIcons = document.querySelectorAll(".floatingObjects img");

floatingIcons.forEach((icon, i) => {
  gsap.to(icon, {
    y: -200,
    ease: "none",
    scrollTrigger: {
      trigger: ".myTools",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  gsap.to(".stair", {
    x: "0%",
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.inOut"
  });


  gsap.to(".stair", {
    x: "100%",
    duration: 0.3,
    stagger: 0.1,
    ease: "power2.inOut",
    delay: 1,
    onComplete: () => {
      document.querySelector(".preloader").style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
});

//paralax cards bls?
const cards = document.querySelectorAll(".cardGrid img");

// parallax 
cards.forEach((img) => {
  gsap.to(img, {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
      trigger: img,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

// blur do card
cards.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    cards.forEach((other) => {
      if (other !== img) {
        gsap.to(other, { filter: "blur(5px)", duration: 0.3 });
      } else {
        gsap.to(other, { filter: "blur(0px)", duration: 0.3 });
      }
    });
  });

  img.addEventListener("mouseleave", () => {
    cards.forEach((other) => {
      gsap.to(other, { filter: "blur(0px)", duration: 0.3 });
    });
  });
});

gsap.to(".columnLeft", {
  y: "-100%", 
  ease: "none",
  scrollTrigger: {
    trigger: ".heroProject", 
    start: "top top", 
    end: "bottom top", 
    scrub: true, 
  }
});