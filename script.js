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


document.querySelectorAll(".content-slider").forEach(slide => {

  const text = slide.querySelector(".textContent");
  const overlay = slide.querySelector(".overlay");

  let open = false;

  slide.addEventListener("dblclick", () => {

    open = !open;

    gsap.to(text, {
      opacity: open ? 0 : 1,
      x: open ? -0 : 0,
      duration: 0.4
    });

    gsap.to(overlay, {
      opacity: open ? 0 : 1,
      duration: 1
    });

  });

});


document.querySelectorAll(".sliderGsap").forEach(slider => {

  let isDown = false;
  let startX;
  let scrollLeft;
  let dragged = false;

  slider.addEventListener("mousedown", e => {
    isDown = true;
    dragged = false;

    startX = e.pageX;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
  });

  slider.addEventListener("mousemove", e => {
    if (!isDown) return;

    const walk = e.pageX - startX;

    if (Math.abs(walk) > 5) dragged = true;

    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener("click", e => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

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