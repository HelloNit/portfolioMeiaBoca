$(document).ready(function () {
    $("#header-placeholder").load("components/header.html", function () {
        inicializarMenu();
    });
    
    $("#footer-placeholder").load("components/footer.html");
});

function inicializarMenu() {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    const header = document.querySelector('[data-header]');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');

        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            menuToggle.textContent = 'Fechar';
            menuToggle.setAttribute('aria-label', 'Fechar menu');
        } else {
            document.body.style.overflow = '';
            menuToggle.textContent = 'Menu';
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        }
    });

    const menuLinks = document.querySelectorAll('[data-menu] a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            document.body.style.overflow = '';
            menuToggle.textContent = 'Menu';
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        });
    });

    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            nav.classList.remove('active');
            document.body.style.overflow = '';
            menuToggle.textContent = 'Menu';
            menuToggle.setAttribute('aria-label', 'Abrir menu');
        }
    });
}

const canvas = document.getElementById("connector-canvas");
const ctx = canvas.getContext("2d");
const wrapper = document.querySelector('.workflow_cards');
const cards = document.querySelectorAll('.card-wrapper, .card:not(.card-wrapper .card)');


let activeCard = null;
let offset = { x: 0, y: 0 };
let lightPosition = 0;

// Variáveis para movimento suave
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
const smoothness = 0.10; // Controla a velocidade (0.05 = lento, 0.3 = rápido, 1.0 = instantâneo)

/**
 * Identifica o breakpoint atual
 */
function getCurrentBreakpoint() {
    const width = window.innerWidth;
    if (width <= 320) return '320';
    if (width <= 375) return '375';
    if (width <= 425) return '425';
    if (width <= 768) return '768';
    return '1024';
}

/**
 * Posições padrão para cada breakpoint
 */
const defaultPositions = {
    '320': [
        { x: 10, y: 50 },
        { x: 10, y: 200 },
        { x: 10, y: 350 },
        { x: 10, y: 500 }
    ],
    '375': [
        { x: 20, y: 50 },
        { x: 20, y: 200 },
        { x: 20, y: 350 },
        { x: 20, y: 500 }
    ],
    '425': [
        { x: 30, y: 50 },
        { x: 30, y: 200 },
        { x: 30, y: 350 },
        { x: 30, y: 500 }
    ],
    '768': [
        { x: 100, y: 50 },
        { x: 100, y: 220 },
        { x: 100, y: 390 },
        { x: 100, y: 560 }
    ],
    '1024': [
        { x: 200, y: 100 },
        { x: 200, y: 300 },
        { x: 200, y: 500 },
        { x: 200, y: 700 }
    ]
};

/**
 * Configuração do canvas com suporte a alta resolução
 */
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrapper.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/**
 * Pega o ponto de ancoragem do card
 */
function getAnchor(card, position = "bottom") {
    const rect = card.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - wrapperRect.left;
    const y = position === "bottom" 
        ? rect.bottom - wrapperRect.top 
        : rect.top - wrapperRect.top;

    return { x, y };
}

/**
 * Desenha as conexões entre os cards com luz animada
 */
function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    cards.forEach((card, index) => {
        if (index < cards.length - 1) {
            const nextCard = cards[index + 1];
            
            const start = getAnchor(card, "bottom");
            const end = getAnchor(nextCard, "top");

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const curveAmount = 100;
            
            // Cria gradiente com luz animada
            const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            
            // Calcula a posição da luz (0 a 1)
            const lightPos = (lightPosition + index * 0.3) % 1;
            
            // Cria o efeito de luz percorrendo a linha
            const lightSize = 0.15; // Tamanho da luz
            
            gradient.addColorStop(0, '#000000');
            
            if (lightPos - lightSize > 0) {
                gradient.addColorStop(lightPos - lightSize, '#000000');
            }
            
            gradient.addColorStop(lightPos, '#ffffff'); // Luz branca no centro
            
            if (lightPos + lightSize < 1) {
                gradient.addColorStop(lightPos + lightSize, '#000000');
            }
            
            gradient.addColorStop(1, '#000000');
            
            ctx.strokeStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            
            ctx.bezierCurveTo(
                start.x + dx * 0.0, start.y + curveAmount,
                end.x - dx * 0.3, end.y - curveAmount,
                end.x, end.y
            );
            
            ctx.stroke();
        }
    });
    
    // Incrementa a posição da luz
    lightPosition += 0.005; // Velocidade da luz
    if (lightPosition > 1) lightPosition = 0;
}

/**
 * Carrega posições do localStorage ou usa padrão
 */
function loadPositions(breakpoint) {
    const key = `cardPositions_${breakpoint}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
        return JSON.parse(saved);
    }
    
    return defaultPositions[breakpoint];
}

/**
 * Salva posições no localStorage por breakpoint
 */
function savePositions() {
    const breakpoint = getCurrentBreakpoint();
    const positions = [];
    
    cards.forEach((card) => {
        positions.push({
            x: parseInt(card.style.left),
            y: parseInt(card.style.top)
        });
    });
    
    const key = `cardPositions_${breakpoint}`;
    localStorage.setItem(key, JSON.stringify(positions));
}

/**
 * Aplica posições nos cards
 */
function applyPositions() {
    const breakpoint = getCurrentBreakpoint();
    const positions = loadPositions(breakpoint);
    
    cards.forEach((card, index) => {
        const pos = positions[index];
        card.style.left = `${pos.x}px`;
        card.style.top = `${pos.y}px`;
    });
}

/**
 * Reseta posições
 */
function resetPositions(breakpoint = null) {
    const bp = breakpoint || getCurrentBreakpoint();
    const key = `cardPositions_${bp}`;
    localStorage.removeItem(key);
    
    if (!breakpoint) {
        applyPositions();
    }
    
    console.log(`🔄 Posições resetadas para ${bp}px!`);
}

function resetAllPositions() {
    ['320', '375', '425', '768', '1024'].forEach(bp => {
        localStorage.removeItem(`cardPositions_${bp}`);
    });
    applyPositions();
}

/**
 * Inicializa os cards
 */
cards.forEach((card, index) => {
    card.style.position = 'absolute';
    card.style.cursor = 'grab';
    
    // Mouse Down
    card.addEventListener('mousedown', (e) => {
        activeCard = card;
        const rect = card.getBoundingClientRect();
        
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        
        // Inicializa posição atual
        currentX = parseInt(card.style.left) || 0;
        currentY = parseInt(card.style.top) || 0;
        targetX = currentX;
        targetY = currentY;
        
        card.style.cursor = 'grabbing';
        card.style.zIndex = '1000';
    });

    // Touch Start
    card.addEventListener('touchstart', (e) => {
        activeCard = card;
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        
        offset.x = touch.clientX - rect.left;
        offset.y = touch.clientY - rect.top;
        
        // Inicializa posição atual
        currentX = parseInt(card.style.left) || 0;
        currentY = parseInt(card.style.top) || 0;
        targetX = currentX;
        targetY = currentY;
        
        card.style.zIndex = '100';
    }, { passive: true });
});

// Aplica posições iniciais
applyPositions();

// Mouse Move - atualiza apenas o target
document.addEventListener('mousemove', (e) => {
    if (!activeCard) return;
    
    const wrapperRect = wrapper.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    
    let x = e.clientX - wrapperRect.left - offset.x;
    let y = e.clientY - wrapperRect.top - offset.y;
    
    x = Math.max(0, Math.min(x, wrapperRect.width - cardRect.width));
    y = Math.max(0, Math.min(y, wrapperRect.height - cardRect.height));
    
    targetX = x;
    targetY = y;
});

// Touch Move - atualiza apenas o target
document.addEventListener('touchmove', (e) => {
    if (!activeCard) return;
    
    const touch = e.touches[0];
    const wrapperRect = wrapper.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    
    let x = touch.clientX - wrapperRect.left - offset.x;
    let y = touch.clientY - wrapperRect.top - offset.y;
    
    x = Math.max(0, Math.min(x, wrapperRect.width - cardRect.width));
    y = Math.max(0, Math.min(y, wrapperRect.height - cardRect.height));
    
    targetX = x;
    targetY = y;
}, { passive: true });

// Mouse Up
document.addEventListener('mouseup', () => {
    if (activeCard) {
        activeCard.style.cursor = 'grab';
        activeCard.style.zIndex = '1';
        savePositions();
        activeCard = null;
    }
});

// Touch End
document.addEventListener('touchend', () => {
    if (activeCard) {
        activeCard.style.zIndex = '1';
        savePositions();
        activeCard = null;
    }
});

// Reposiciona ao redimensionar
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        applyPositions();
    }, 250);
});

function animate() {
    if (activeCard) {
        currentX += (targetX - currentX) * smoothness;
        currentY += (targetY - currentY) * smoothness;
        
        activeCard.style.left = `${currentX}px`;
        activeCard.style.top = `${currentY}px`;
    }
    
    draw();
    requestAnimationFrame(animate);
}

animate();

window.resetCardPositions = resetPositions;
window.resetAllCardPositions = resetAllPositions;


let currentSlide = 0;
const slides = document.querySelectorAll('.slider_item');
const totalSlides = slides.length;
const sliderContainer = document.querySelector('.slider_container');
const btnPrev = document.querySelector('.slider_prev');
const btnNext = document.querySelector('.slider_next');

function goToSlide(index) {
    currentSlide = index;
    const offset = -currentSlide * 100;
    sliderContainer.style.transform = `translateX(${offset}%)`;
}

// Botão PRÓXIMO
btnNext.addEventListener('click', () => {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
    } else {
        goToSlide(0);
    }
});

// Botão ANTERIOR
btnPrev.addEventListener('click', () => {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    } else {
        goToSlide(totalSlides - 1);
    }
});

// Clique no card pra remover overlay e texto COM TRANSIÇÃO
slides.forEach(slide => {
    slide.addEventListener('click', () => {
        const overlay = slide.querySelector('.overlay');
        const contentText = slide.querySelector('.content_text');
        
        // Toggle com classes
        overlay.classList.toggle('hidden');
        contentText.classList.toggle('hidden');
    });
});


// tooltip final

const cardWrappers = document.querySelectorAll('.card_wrapper_considerations');

function isMobile() {
    return window.innerWidth <= 767;
}

cardWrappers.forEach(wrapper => {
    const tooltips = wrapper.querySelectorAll('.tooltip_person');

    tooltips.forEach(tooltip => {
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.transition = 'opacity 1s ease, transform 0.6s ease';
    });

    wrapper.addEventListener('mouseenter', () => {
        if (isMobile()) return;

        tooltips.forEach((tooltip, index) => {
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.pointerEvents = 'auto';

                if (tooltip.classList.contains('tooltip-left')) {
                    tooltip.style.transform = 'translateY(-50%) translateX(0)';
                }
                if (tooltip.classList.contains('tooltip-right')) {
                    tooltip.style.transform = 'translateY(0%) translateX(0)';
                }

            }, index * 100);
        });
    });

    wrapper.addEventListener('mouseleave', () => {
        if (isMobile()) return;

        tooltips.forEach(tooltip => {
            tooltip.style.opacity = '0';
            tooltip.style.pointerEvents = 'none';

            if (tooltip.classList.contains('tooltip-left')) {
                tooltip.style.transform = 'translateY(-50%) translateX(10px)';
            }
            if (tooltip.classList.contains('tooltip-right')) {
                tooltip.style.transform = 'translateY(0%) translateX(-10px)';
            }
        });
    });
});