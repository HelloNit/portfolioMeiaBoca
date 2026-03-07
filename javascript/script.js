$(document).ready(function () {
    $("#header-placeholder").load("components/header.html", function () {
        inicializarMenu();
    });

    $("#footer-placeholder").load("components/footer.html", function () {
        inicializarFooter();
    });
});

function inicializarFooter() {
    const copyLink = document.getElementById('copy-email');
    if (!copyLink) return;

    const feedback = document.createElement('span');
    feedback.classList.add('copy_feedback');
    feedback.textContent = 'E-mail copiado!';
    copyLink.appendChild(feedback);

    copyLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText('felipe@srrodrigues.com');
        feedback.classList.add('visible');
        setTimeout(() => feedback.classList.remove('visible'), 1000);
    });
}

function inicializarMenu() {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    const header = document.querySelector('[data-header]');

    function fecharMenu() {
        nav.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle.textContent = 'Menu';
        menuToggle.setAttribute('aria-label', 'Abrir menu');
    }

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');

        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            menuToggle.textContent = 'Fechar';
            menuToggle.setAttribute('aria-label', 'Fechar menu');
        } else {
            fecharMenu();
        }
    });

    document.querySelectorAll('[data-menu] a').forEach(link => {
        link.addEventListener('click', fecharMenu);
    });

    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) fecharMenu();
    });

    // Safe eyes
    const overlay = document.getElementById('safe-eyes-overlay');
    const safeEyesButtons = document.querySelectorAll('.wrapper_colors button');

    const colors = {
        'default': 'transparent',
        'red': 'rgba(255, 81, 0, 0.20)',
        'orange': 'rgba(231, 85, 0, 0.20)',
        'blue': 'rgba(0, 100, 255, 0.08)',
    };

    const savedColor = localStorage.getItem('safeEyesColor');
    if (savedColor && overlay) {
        overlay.style.backgroundColor = colors[savedColor] ?? 'transparent';
    }

    safeEyesButtons.forEach(button => {
        const key = button.id.split('-')[2];
        if (key === savedColor) button.classList.add('active');

        button.addEventListener('click', () => {
            safeEyesButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const key = button.id.split('-')[2];
            overlay.style.backgroundColor = colors[key] ?? 'transparent';
            localStorage.setItem('safeEyesColor', key);
        });
    });
}

// Canvas — cards arrastáveis

const canvas = document.getElementById("connector-canvas");

if (canvas) {
    const ctx = canvas.getContext("2d");
    const wrapper = document.querySelector('.workflow_cards');
    const cards = document.querySelectorAll('.card-wrapper, .card:not(.card-wrapper .card)');

    let activeCard = null;
    let offset = { x: 0, y: 0 };
    let lightPosition = 0;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const smoothness = 0.05;

    // Tudo acima de 768px usa as posições do 1024
    function getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width <= 320) return '320';
        if (width <= 375) return '375';
        if (width <= 425) return '425';
        if (width <= 768) return '768';
        return '1024';
    }

    const defaultPositions = {
        '320': [
            { x: 35, y: 5 },
            { x: 0, y: 257 },
            { x: 28, y: 480 },
            { x: 0, y: 694 }
        ],
        '375': [
            { x: 1, y: 3 },
            { x: 94, y: 203 },
            { x: 2, y: 416 },
            { x: 0, y: 30 }
        ],
        '425': [
            { x: 3, y: 6 },
            { x: 137, y: 208 },
            { x: 0, y: 366 },
            { x: 0, y: 634 }
        ],
        '768': [
            { x: 13, y: 6 },
            { x: 414, y: 195 },
            { x: 198, y: 391 },
            { x: 0, y: 643 }
        ],
        '1024': [
            { x: 167, y: 77 },
            { x: 439, y: 315 },
            { x: 27, y: 470 },
            { x: 350, y: 644 }
        ]
    };

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = wrapper.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        ctx.scale(dpr, dpr);
        applyPositions(); // reposiciona os cards quando o wrapper muda de tamanho
    }

    function getAnchor(card, position = "bottom") {
        const rect = card.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - wrapperRect.left,
            y: position === "bottom"
                ? rect.bottom - wrapperRect.top
                : rect.top - wrapperRect.top
        };
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        cards.forEach((card, index) => {
            if (index >= cards.length - 1) return;

            const nextCard = cards[index + 1];
            const start = getAnchor(card, "bottom");
            const end = getAnchor(nextCard, "top");
            const dx = end.x - start.x;
            const curveAmount = 100;

            const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            const lightPos = (lightPosition + index * 0.3) % 1;
            const lightSize = 0.30;

            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            if (lightPos - lightSize > 0) gradient.addColorStop(lightPos - lightSize, '#000000');
            gradient.addColorStop(lightPos, '#ffffff');
            if (lightPos + lightSize < 1) gradient.addColorStop(lightPos + lightSize, '#000000');
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
        });

        lightPosition += 0.005;
        if (lightPosition > 1) lightPosition = 0;
    }

    function loadPositions(breakpoint) {
        const saved = localStorage.getItem(`cardPositions_${breakpoint}`);
        if (saved) return JSON.parse(saved);
        return defaultPositions[breakpoint];
    }

    function savePositions() {
        const breakpoint = getCurrentBreakpoint();
        const positions = Array.from(cards).map(card => ({
            x: parseInt(card.style.left),
            y: parseInt(card.style.top)
        }));
        localStorage.setItem(`cardPositions_${breakpoint}`, JSON.stringify(positions));
    }

    function applyPositions() {
        const breakpoint = getCurrentBreakpoint();
        const positions = loadPositions(breakpoint);
        const wrapperRect = wrapper.getBoundingClientRect();

        cards.forEach((card, index) => {
            const pos = positions[index];
            const x = Math.max(0, Math.min(pos.x, wrapperRect.width - card.offsetWidth));
            const y = Math.max(0, Math.min(pos.y, wrapperRect.height - card.offsetHeight));
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
        });
    }

    function resetPositions(breakpoint = null) {
        const bp = breakpoint || getCurrentBreakpoint();
        localStorage.removeItem(`cardPositions_${bp}`);
        if (!breakpoint) applyPositions();
    }

    function resetAllPositions() {
        ['320', '375', '425', '768', '1024'].forEach(bp => {
            localStorage.removeItem(`cardPositions_${bp}`);
        });
        applyPositions();
    }

    cards.forEach((card) => {
        card.style.position = 'absolute';
        card.style.cursor = 'grab';

        card.addEventListener('mousedown', (e) => {
            activeCard = card;
            const rect = card.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            currentX = parseInt(card.style.left) || 0;
            currentY = parseInt(card.style.top) || 0;
            targetX = currentX;
            targetY = currentY;
            card.style.cursor = 'grabbing';
            card.style.zIndex = '1000';
        });

        card.addEventListener('touchstart', (e) => {
            activeCard = card;
            const touch = e.touches[0];
            const rect = card.getBoundingClientRect();
            offset.x = touch.clientX - rect.left;
            offset.y = touch.clientY - rect.top;
            currentX = parseInt(card.style.left) || 0;
            currentY = parseInt(card.style.top) || 0;
            targetX = currentX;
            targetY = currentY;
            card.style.zIndex = '100';
        }, { passive: true });
    });

    applyPositions();

    document.addEventListener('mousemove', (e) => {
        if (!activeCard) return;
        const wrapperRect = wrapper.getBoundingClientRect();
        let x = e.clientX - wrapperRect.left - offset.x;
        let y = e.clientY - wrapperRect.top - offset.y;
        targetX = Math.max(0, Math.min(x, wrapperRect.width - activeCard.offsetWidth));
        targetY = Math.max(0, Math.min(y, wrapperRect.height - activeCard.offsetHeight));
    });

    document.addEventListener('touchmove', (e) => {
        if (!activeCard) return;
        const touch = e.touches[0];
        const wrapperRect = wrapper.getBoundingClientRect();
        let x = touch.clientX - wrapperRect.left - offset.x;
        let y = touch.clientY - wrapperRect.top - offset.y;
        targetX = Math.max(0, Math.min(x, wrapperRect.width - activeCard.offsetWidth));
        targetY = Math.max(0, Math.min(y, wrapperRect.height - activeCard.offsetHeight));
    }, { passive: true });

    document.addEventListener('mouseup', () => {
        if (!activeCard) return;
        activeCard.style.cursor = 'grab';
        activeCard.style.zIndex = '1';
        savePositions();
        activeCard = null;
    });

    document.addEventListener('touchend', () => {
        if (!activeCard) return;
        activeCard.style.zIndex = '1';
        savePositions();
        activeCard = null;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            applyPositions();
        }, 250);
    });

    resizeCanvas();

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

    // Slider

    const sliderContainer = document.querySelector('.slider_container');

    if (sliderContainer) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slider_item');
        const totalSlides = slides.length;
        const btnPrev = document.querySelector('.slider_prev');
        const btnNext = document.querySelector('.slider_next');

        function goToSlide(index) {
            currentSlide = index;
            sliderContainer.style.transform = `translateX(${-currentSlide * 100}%)`;
        }

        btnNext.addEventListener('click', () => {
            goToSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
        });

        btnPrev.addEventListener('click', () => {
            goToSlide(currentSlide > 0 ? currentSlide - 1 : totalSlides - 1);
        });

        slides.forEach(slide => {
            slide.addEventListener('click', () => {
                slide.querySelector('.overlay').classList.toggle('hidden');
                slide.querySelector('.content_text').classList.toggle('hidden');
            });
        });
    }

    // Tooltips considerações

    const cardWrappers = document.querySelectorAll('.card_wrapper_considerations');

    if (cardWrappers.length > 0) {
        const isMobile = () => window.innerWidth <= 767;

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
                        if (tooltip.classList.contains('tooltip-left')) tooltip.style.transform = 'translateY(-50%) translateX(0)';
                        if (tooltip.classList.contains('tooltip-right')) tooltip.style.transform = 'translateY(0%) translateX(0)';
                    }, index * 100);
                });
            });

            wrapper.addEventListener('mouseleave', () => {
                if (isMobile()) return;
                tooltips.forEach(tooltip => {
                    tooltip.style.opacity = '0';
                    tooltip.style.pointerEvents = 'none';
                    if (tooltip.classList.contains('tooltip-left')) tooltip.style.transform = 'translateY(-50%) translateX(10px)';
                    if (tooltip.classList.contains('tooltip-right')) tooltip.style.transform = 'translateY(0%) translateX(-10px)';
                });
            });
        });
    }
}

// Accordion

document.querySelectorAll('.accordion').forEach(acc => {
    acc.addEventListener('click', function () {
        this.classList.toggle('active');
        const panel = this.nextElementSibling;
        panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + 'px';
    });
});

// Transição de página
const transition = document.getElementById('page-transition');

function iniciarTransicao() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (transition) transition.classList.add('fade-out');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarTransicao);
} else {
    iniciarTransicao();
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link || !link.href) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('mailto') || link.href.startsWith('#')) return;

    e.preventDefault();
    const destination = link.href;
    transition.classList.remove('fade-out');
    setTimeout(() => { window.location.href = destination; }, 400);
});