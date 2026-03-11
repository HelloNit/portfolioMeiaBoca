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


// ─────────────────────────────────────────────────────────────
//  MAPPING CONFIG
// ─────────────────────────────────────────────────────────────

const MAPPING_CONFIG = [
    {
        screenIndex: 1,
        varName: "atuacao",
        options: [
            { value: "Back-end", varValue: "backend" },
            { value: "Front-end", varValue: "frontend" },
            { value: "Quality Assurance", varValue: "qa" },
            { value: "UX Research", varValue: "ux" },
        ],
    },
    {
        screenIndex: 2,
        varName: "trocarArea",
        options: [
            { value: "Sim", varValue: "true" },
            { value: "Não", varValue: "false" },
        ],
    },
    {
        screenIndex: 3,
        varName: "musica",
        options: [
            { value: "Rock", varValue: "rock" },
            { value: "Samba", varValue: "samba" },
            { value: "Axé", varValue: "axe" },
            { value: "MPB", varValue: "mpb" },
            { value: "Outro gênero músical", varValue: "outro" },
        ],
    },
    {
        screenIndex: 4,
        varName: "pais",
        options: [
            { value: "Brasil", varValue: "br" },
            { value: "Canadá", varValue: "ca" },
            { value: "Noruega", varValue: "no" },
            { value: "Suécia", varValue: "se" },
        ],
    },
];

// ─────────────────────────────────────────────────────────────
//  SVGs inline
// ─────────────────────────────────────────────────────────────

const SVG_CONDITIONAL = `<svg class="map_icon" viewBox="0 0 24 24" fill="none" stroke="#79b8ff" stroke-width="1.8"><path d="M9 18l6-6-6-6"/></svg>`;
const SVG_VAR = `<svg class="map_icon_sm" viewBox="0 0 24 24" fill="none" stroke="#c9d1d9" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`;
const SVG_VARIATION = `<svg class="map_icon_sm" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
const SVG_CHECK = `<svg class="map_icon" viewBox="0 0 24 24" fill="none" stroke="#56d364" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;

// ─────────────────────────────────────────────────────────────
//  BUILD BLOCK
// ─────────────────────────────────────────────────────────────

function buildBlock(cfg, blockId) {
    const optionPills = cfg.options.map((opt, i) =>
        `<span class="map_pill" id="pill_${blockId}_${i}">${opt.varValue}</span>${i < cfg.options.length - 1 ? `<span class="map_muted">or</span>` : ''}`
    ).join('');

    return `
    <div class="map_block" id="block_${blockId}">
        <div class="map_row">
            ${SVG_CONDITIONAL}
            <span class="map_keyword">if</span>
            ${optionPills}
        </div>
        <div class="map_row" id="set_${blockId}">
            ${SVG_VARIATION}
            ${SVG_VAR}
            <span class="map_keyword set">Set</span>
            <span class="map_pill" id="setpill_${blockId}">report/${cfg.varName}</span>
            <span class="map_muted">to</span>
            <span class="map_pill" id="setval_${blockId}">—</span>
        </div>
        <div class="map_row" id="else_${blockId}">
            <span class="map_keyword else">else</span>
            ${SVG_VARIATION}
            <span class="map_muted">Set errorMessage → true</span>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
//  INIT PANEL
// ─────────────────────────────────────────────────────────────

function initMappingPanel() {
    const panel = document.querySelector(".mapping_figma_copy");
    if (!panel) return;

    panel.querySelectorAll(".map_block, .map_connector").forEach(el => el.remove());

    MAPPING_CONFIG.forEach((cfg, i) => {
        if (i > 0) {
            const connector = document.createElement("div");
            connector.className = "map_connector";
            connector.innerHTML = `<div class="map_connector_line"></div><span class="map_connector_label">next →</span>`;
            panel.appendChild(connector);
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = buildBlock(cfg, i);
        panel.appendChild(wrapper.firstElementChild);
    });

    // Bloco final submit
    const connectorFinal = document.createElement("div");
    connectorFinal.className = "map_connector";
    connectorFinal.innerHTML = `<div class="map_connector_line"></div><span class="map_connector_label">next →</span>`;
    panel.appendChild(connectorFinal);

    const finalBlock = document.createElement("div");
    finalBlock.className = "map_block";
    finalBlock.id = "block_final";
    finalBlock.innerHTML = `
        <div class="map_row">
            ${SVG_CHECK}
            <span class="map_keyword done">Submit</span>
            <span class="map_pill" id="pill_final">formComplete</span>
        </div>`;
    panel.appendChild(finalBlock);
}

// ─────────────────────────────────────────────────────────────
//  UPDATE MAPPING
// ─────────────────────────────────────────────────────────────

function updateMapping(screenIndex, selectedVarValue) {
    const finalBlk = document.getElementById("block_final");
    const finalPill = document.getElementById("pill_final");

    MAPPING_CONFIG.forEach((cfg, i) => {
        const block = document.getElementById(`block_${i}`);
        const setVal = document.getElementById(`setval_${i}`);
        const setpill = document.getElementById(`setpill_${i}`);
        if (!block) return;

        // Reseta pills
        cfg.options.forEach((_, j) => {
            const pill = document.getElementById(`pill_${i}_${j}`);
            if (pill) pill.classList.remove("active_pill", "done_pill");
        });
        if (setpill) setpill.classList.remove("active_pill", "done_pill");
        if (setVal) setVal.classList.remove("active_pill", "done_pill");

        // Tela já concluída
        if (screenIndex > cfg.screenIndex) {
            block.classList.replace("is_active", "is_done") || block.classList.add("is_done");
            const saved = block.dataset.savedValue;
            if (saved) {
                const idx = cfg.options.findIndex(o => o.varValue === saved);
                const pill = document.getElementById(`pill_${i}_${idx}`);
                if (pill) pill.classList.add("done_pill");
                if (setVal) { setVal.textContent = saved; setVal.classList.add("done_pill"); }
                if (setpill) setpill.classList.add("done_pill");
            }
            return;
        }

        // Tela futura
        if (screenIndex < cfg.screenIndex) {
            block.classList.remove("is_active", "is_done");
            return;
        }

        // Tela atual
        block.classList.add("is_active");
        block.classList.remove("is_done");

        if (selectedVarValue) {
            const idx = cfg.options.findIndex(o => o.varValue === selectedVarValue);
            const pill = document.getElementById(`pill_${i}_${idx}`);
            if (pill) pill.classList.add("active_pill");
            if (setVal) { setVal.textContent = selectedVarValue; setVal.classList.add("active_pill"); }
            if (setpill) setpill.classList.add("active_pill");
            block.dataset.savedValue = selectedVarValue;
        } else {
            if (setVal) setVal.textContent = "—";
        }
    });

    // Bloco final
    if (finalBlk && finalPill) {
        if (screenIndex === 5) {
            finalBlk.classList.add("is_active");
            finalPill.classList.add("done_pill");
        } else {
            finalBlk.classList.remove("is_active");
            finalPill.classList.remove("done_pill");
        }
    }
}

// ─────────────────────────────────────────────────────────────
//  HELPER — resolve varValue a partir do label do radio
// ─────────────────────────────────────────────────────────────

function resolveVarValue(screenIndex, labelText) {
    const cfg = MAPPING_CONFIG.find(c => c.screenIndex === screenIndex);
    if (!cfg) return null;
    const opt = cfg.options.find(o => o.value.trim() === labelText.trim());
    return opt ? opt.varValue : null;
}

// ─────────────────────────────────────────────────────────────
//  PROTOTYPE LOGIC
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

    let currentScreen = 0;

    const screens = document.querySelectorAll(".screen_content");
    const nextButtons = document.querySelectorAll(".next");
    const backButtons = document.querySelectorAll(".back");
    const progressFills = document.querySelectorAll(".progress-fill");
    const progressTexts = document.querySelectorAll(".progress-percent");

    // Hover do #start ativa efeito pixelizado na imagem
    const startBtn = document.getElementById("start");
    const imgContainer = document.querySelector(".img_container");

    startBtn.addEventListener("mouseenter", () => imgContainer.classList.add("hover-active"));
    startBtn.addEventListener("mouseleave", () => imgContainer.classList.remove("hover-active"));

    // ── Inicializa o painel de mapping ──
    initMappingPanel();
    updateMapping(0, null);

    // ── Progress bar ──
    function updateProgress() {
        const percent = ((currentScreen + 1) / screens.length) * 100;
        progressFills.forEach(bar => { bar.style.width = percent + "%"; });
        progressTexts.forEach(text => { text.textContent = Math.round(percent) + "%"; });
    }

    // ── Troca de tela ──
    function showScreen(index) {
        screens.forEach(s => s.classList.remove("active"));
        screens[index].classList.add("active");
        updateProgress();

        // Passa o valor já salvo no bloco (se existir) ao voltar para uma tela
        const cfg = MAPPING_CONFIG.find(c => c.screenIndex === index);
        const savedBlock = cfg ? document.getElementById(`block_${MAPPING_CONFIG.indexOf(cfg)}`) : null;
        const savedValue = savedBlock ? savedBlock.dataset.savedValue || null : null;
        updateMapping(index, savedValue);
    }

    // ── Botão Iniciar ──
    nextButtons.forEach(btn => {
        if (btn.id === "start") {
            btn.addEventListener("click", () => {
                currentScreen = 1;
                showScreen(currentScreen);
            });
            return;
        }

        // ── Botões Próximo ──
        btn.addEventListener("click", () => {
            const current = screens[currentScreen];
            const selected = current.querySelector('input[type="radio"]:checked');
            const errorMsg = current.querySelector(".error_msg");

            if (!selected) {
                if (errorMsg) errorMsg.classList.add("active");
                // Mapping: sem seleção → destaca else
                updateMapping(currentScreen, null);
                return;
            }

            if (errorMsg) errorMsg.classList.remove("active");

            // Salva o varValue antes de avançar
            const labelText = selected.closest("label")?.querySelector("span")?.textContent || "";
            const varValue = resolveVarValue(currentScreen, labelText);
            if (varValue) {
                const cfgIdx = MAPPING_CONFIG.findIndex(c => c.screenIndex === currentScreen);
                const blk = document.getElementById(`block_${cfgIdx}`);
                if (blk) blk.dataset.savedValue = varValue;
            }

            if (currentScreen < screens.length - 1) {
                currentScreen++;
                showScreen(currentScreen);
            }
        });
    });

    // ── Botões Voltar ──
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentScreen > 0) {
                currentScreen--;
                showScreen(currentScreen);
            }
        });
    });

    // ── Radio change — atualiza mapping em tempo real ──
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            const screen = radio.closest(".screen_content");
            const errorMsg = screen?.querySelector(".error_msg");
            if (errorMsg) errorMsg.classList.remove("active");

            const labelText = radio.closest("label")?.querySelector("span")?.textContent || "";
            const varValue = resolveVarValue(currentScreen, labelText);
            updateMapping(currentScreen, varValue);
        });
    });

    updateProgress();
});

gsap.registerPlugin(ScrollTrigger);

gsap.set(".content_final_result", { 
  y: 120, 
  opacity: 0, 
  scale: 0.92
});

gsap.to(".content_final_result", {
  y: 0,
  opacity: 1,
  scale: 1,
  borderRadius: "0px",
  duration: 3.2,
  ease: "expo.out",
  scrollTrigger: {
    trigger: ".content_final_result",
    start: "top 90%",
    toggleActions: "play none none none",
  }
});

gsap.fromTo(".content_final h2, .content_final p", 
  { y: 30, opacity: 0 },
  {
    y: 0, opacity: 1,
    duration: 0.9,
    stagger: 0.15,
    ease: "power3.out",
    delay: 0.3,
    scrollTrigger: {
      trigger: ".content_final_result",
      start: "top 90%",
      toggleActions: "play none none none",
    }
  }
);