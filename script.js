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
    this.bind(this.titleUp, 'ux');
    this.bind(this.titleDown, 'ui');
  }

  bind(element, type) {
    element.addEventListener('mouseenter', () => {
      this.startSwapping(type);
      this.waveEffect.startWave();
    });

    element.addEventListener('mouseleave', () => {
      this.stopSwapping();
      this.waveEffect.stopWave();
    });

    element.addEventListener('mousemove', (e) => {
      this.waveEffect.updateMouseFromElement(e, element);
    });
  }

  startSwapping(type) {
    if (this.isSwapping) return;
    this.isSwapping = true;

    this.hideAllImages(this.uiImages);
    this.hideAllImages(this.uxImages);

    if (type === 'ux') {
      this.currentUXIndex = 0;
      this.showImage(this.uxImages[0]);
    } else {
      this.currentUIIndex = 0;
      this.showImage(this.uiImages[0]);
    }

    this.swapInterval = setInterval(() => {
      type === 'ux'
        ? this.swapUXImages()
        : this.swapUIImages();
    }, 400);
  }

  stopSwapping() {
    this.isSwapping = false;
    clearInterval(this.swapInterval);

    this.hideAllImages(this.uiImages);
    this.hideAllImages(this.uxImages);
    this.showImage(this.uiImages[0]);
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

    this.width = this.svg.viewBox.baseVal.width || 1143;

    this.centerY = this.svg.viewBox.baseVal.height / 0.1;

    this.numPoints = 240;

    this.idleAmplitude = 0.9;
    this.maxAmplitude = this.idleAmplitude;
    this.targetAmplitude = 8;

    this.influenceRadius = this.width * 0.6;

    this.mouseX = this.width / 9;
    this.isHovering = false;

    this.points = [];
    this.init();
  }

  init() {
    this.createPoints();
    this.animate();
  }

  createPoints() {
    this.points = [];
    for (let i = 0; i <= this.numPoints; i++) {
      const x = (i / this.numPoints) * this.width;
      this.points.push({
        x,
        y: this.centerY,
        baseY: this.centerY,
        v: 0
      });
    }
  }

  startWave() {
    this.isHovering = true;
    gsap.to(this, {
      maxAmplitude: this.targetAmplitude,
      duration: 1.2,
      ease: 'power3.out'
    });
  }

  stopWave() {
    this.isHovering = false;
    gsap.to(this, {
      maxAmplitude: this.idleAmplitude,
      duration: 1.2,
      ease: 'power3.out'
    });
  }

  updateMouseFromElement(e, el) {
    const r = el.getBoundingClientRect();
    this.mouseX = ((e.clientX - r.left) / r.width) * this.width;
  }

  update() {
    const t = Date.now() * 0.015;

    this.points.forEach(p => {
      const d = Math.abs(p.x - this.mouseX);
      const falloff = Math.exp(-d / this.influenceRadius);

      // wave contínua
      const idleWave =
        Math.sin(t + p.x * 0.02) * this.idleAmplitude;

      // intensidade no hover
      const hoverWave =
        Math.sin(t + p.x * 0.04) * this.maxAmplitude * falloff;

      const target =
        p.baseY + idleWave + (this.isHovering ? hoverWave : 0);

      p.v += (target - p.y) * 0.12;
      p.v *= 0.8;
      p.y += p.v;
    });
  }

  draw() {
    let d = `M ${this.points[0].x} ${this.points[0].y}`;
    for (let i = 1; i < this.points.length; i++) {
      d += ` L ${this.points[i].x} ${this.points[i].y}`;
    }
    this.path.setAttribute('d', d);
  }

  animate() {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    loop();
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

// so inicializa o mosaico se não for mobile
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



