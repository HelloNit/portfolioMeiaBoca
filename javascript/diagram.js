const width = 800;
const height = 600;
const totalNodes = 10;

// Nó principal
const mainNode = {
    id: 0,
    name: "Figma Design",
    x: width / 2,
    y: height / 2,
    type: "main",
    radius: 60
};

const nodeNames = [
    "Onboarding", "Updates", "Release", "Drafts", "Sketch",
    "Workstation", "Final Prototype", "Handoff", "Final low", "Componentes"
];

const secondaryNodes = [];
const circleRadius = 200;
const angleStep = (2 * Math.PI) / totalNodes;

for (let i = 0; i < totalNodes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    
    const spiralX = mainNode.x;
    const spiralY = mainNode.y;
    
    const circleX = mainNode.x + circleRadius * Math.cos(angle);
    const circleY = mainNode.y + circleRadius * Math.sin(angle);
    
    secondaryNodes.push({
        id: i + 1,
        name: nodeNames[i],
        x: spiralX,
        y: spiralY,
        targetX: circleX,
        targetY: circleY,
        type: "secondary",
        radius: 60,
        angle: angle
    });
}

const nodes = [mainNode, ...secondaryNodes];

const svg = d3.select("#diagram")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const linkGroup = svg.append("g").attr("class", "link-group");
const nodeGroup = svg.append("g").attr("class", "node-group");

// Links
const links = secondaryNodes.map((node, i) => ({
    source: 0,
    target: i + 1
}));

function getLinkPoints(sourceData, targetData) {
    const dx = targetData.x - sourceData.x;
    const dy = targetData.y - sourceData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0 || distance < (sourceData.radius + targetData.radius)) {
        return { x1: sourceData.x, y1: sourceData.y, x2: targetData.x, y2: targetData.y };
    }
    
    const x1 = sourceData.x + (dx / distance) * sourceData.radius;
    const y1 = sourceData.y + (dy / distance) * sourceData.radius;
    const x2 = targetData.x - (dx / distance) * targetData.radius;
    const y2 = targetData.y - (dy / distance) * targetData.radius;
    
    return { x1, y1, x2, y2 };
}

const link = linkGroup.selectAll(".link")
    .data(links)
    .join("line")
    .attr("class", "link")
    .style("opacity", 0)
    .attr("stroke-width", 2)
    .attr("x1", mainNode.x)
    .attr("y1", mainNode.y)
    .attr("x2", mainNode.x)
    .attr("y2", mainNode.y);

// Nós
const node = nodeGroup.selectAll(".node")
    .data(nodes)
    .join("g")
    .attr("class", d => d.type === "main" ? "node-main" : "node-secondary")
    .attr("transform", d => `translate(${d.x},${d.y})`);

node.append("circle")
    .attr("r", d => d.radius)
    .style("opacity", d => d.type === "main" ? 1 : 0);

node.filter(d => d.type === "main")
    .append("image")
    .attr("xlink:href", "img/Figma-logo.svg")
    .attr("x", -50)
    .attr("y", -50)
    .attr("width", 100)
    .attr("height", 100)
    .style("opacity", 1);


node.filter(d => d.type === "secondary")
    .append("text")
    .attr("class", "label")
    .attr("dy", 5)
    .text(d => d.name)
    .style("opacity", 0);

const diagram = document.querySelector('#diagram');
let hasAnimated = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio >= 0.8 && !hasAnimated) {
            hasAnimated = true;
            animateExplosion();
        }
    });
}, {
    threshold: [0.8]
});

observer.observe(diagram);

// Função para atualizar UMA linha específica
function updateSingleLink(linkElement, linkData) {
    const source = nodes[linkData.source];
    const target = nodes[linkData.target];
    const points = getLinkPoints(source, target);
    
    d3.select(linkElement)
        .attr("x1", points.x1)
        .attr("y1", points.y1)
        .attr("x2", points.x2)
        .attr("y2", points.y2);
}

// ANIMAÇÃO
function animateExplosion() {
    // 1. Main node pulsa (círculo + imagem)
    anime({
        targets: '.node-main circle',
        scale: [1, 1.2, 1],
        duration: 600,
        easing: 'easeInOutQuad'
    });
    
    anime({
        targets: '.node-main image',
        scale: [1, 1.2, 1],
        duration: 600,
        easing: 'easeInOutQuad'
    });

    // 2. Nós secundários explodem
    secondaryNodes.forEach((nodeData, i) => {
        anime({
            targets: `.node-secondary:nth-of-type(${i + 2}) circle, .node-secondary:nth-of-type(${i + 2}) text`,
            opacity: [0, 1],
            scale: [0, 1],
            duration: 600,
            delay: 400 + (i * 80),
            easing: 'easeOutBack'
        });

        anime({
            targets: nodeData,
            x: nodeData.targetX,
            y: nodeData.targetY,
            duration: 1200,
            delay: 400 + (i * 80),
            easing: 'easeOutElastic(1, .6)',
            update: () => {
                d3.select(`.node-secondary:nth-of-type(${i + 2})`)
                    .attr("transform", `translate(${nodeData.x},${nodeData.y})`);
                
                const linkElement = link.nodes()[i];
                const linkData = links[i];
                updateSingleLink(linkElement, linkData);
            }
        });
    });

    // 3. Fade in das linhas
    setTimeout(() => {
        anime({
            targets: '.link',
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(80),
            easing: 'easeInOutQuad'
        });
    }, 800);

    // 4. Pulso contínuo
    setTimeout(() => {
        gentlePulse();
    }, 2500);
}

function gentlePulse() {
    // Pulsa círculo E imagem juntos
    anime({
        targets: '.node-main circle',
        scale: [1, 1.1, 1],
        duration: 3000,
        easing: 'easeInOutSine',
        loop: true
    });
    
    anime({
        targets: '.node-main image',
        scale: [1, 1.1, 1],
        duration: 3000,
        easing: 'easeInOutSine',
        loop: true
    });

    anime({
        targets: '.node-secondary circle',
        scale: [1, 0.9, 1],
        duration: 5000,
        delay: anime.stagger(400),
        easing: 'easeInOutSine',
        loop: true
    });
}

console.log('✅ Main node com imagem! 🎨');