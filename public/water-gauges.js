// Water Gauges for SEL Skills
// This script renders animated SVG water level gauges for each SEL skill.

const SKILL_LABELS = [
    'Naming Emotions',
    'Calming Down',
    "Understanding Others",
    'Solving Conflicts'
];
const SKILL_KEYS = [
    ['namingEmotions_B', 'namingEmotions_N'],
    ['calming_B', 'calming_N'],
    ['understandingOthers_B', 'understandingOthers_N'],
    ['solvingConflicts_B', 'solvingConflicts_N']
];

function getWaterColor(score) {
    if (score >= 4) return '#2196f3'; // Blue (strong)
    if (score >= 2) return '#00bcd4'; // Teal (developing)
    return '#e53935'; // Red (needs support)
}

function renderWaterGauges(assessment) {
    const container = document.getElementById('water-gauges');
    if (!assessment) {
        container.innerHTML = '';
        return;
    }
    let html = '<div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">';
    for (let i = 0; i < SKILL_LABELS.length; i++) {
        const [beginKey, currKey] = SKILL_KEYS[i];
        const begin = parseInt(assessment[beginKey]) || 0;
        const curr = parseInt(assessment[currKey]) || 0;
        const color = getWaterColor(curr);
        const beginPct = 100 - (begin / 5) * 100;
        const currPct = 100 - (curr / 5) * 100;
        html += `
        <div style="display: flex; flex-direction: column; align-items: center;">
            <svg width="90" height="120" viewBox="0 0 90 120">
                <!-- Glass outline -->
                <rect x="20" y="20" width="50" height="80" rx="20" fill="#e3f2fd" stroke="#90caf9" stroke-width="3"/>
                <!-- Beginning water level (faint) -->
                <rect x="20" y="${20 + (80 * beginPct / 100)}" width="50" height="${80 - (80 * beginPct / 100)}" rx="20" fill="#b3e5fc" opacity="0.5"/>
                <!-- Current water level (animated) -->
                <rect id="water-fill-${i}" x="20" y="${20 + (80 * 1)}" width="50" height="0" rx="20" fill="${color}" opacity="0.85"/>
                <!-- Skill label -->
                <text x="45" y="115" text-anchor="middle" font-size="13" fill="#1976d2">${SKILL_LABELS[i]}</text>
                <!-- Score text -->
                <text id="score-text-${i}" x="45" y="60" text-anchor="middle" font-size="22" font-weight="bold" fill="#0f2c4d">${curr}/5</text>
            </svg>
            <div style="margin-top: 0.5em; font-size: 1em; color: #666;">${curr - begin >= 1 ? '⬆️ +' + (curr-begin) : (curr-begin === 0 ? '➖' : '⬇️ ' + (curr-begin))}</div>
        </div>
        `;
    }
    html += '</div>';
    container.innerHTML = html;
    // Animate water fill
    for (let i = 0; i < SKILL_LABELS.length; i++) {
        const [beginKey, currKey] = SKILL_KEYS[i];
        const begin = parseInt(assessment[beginKey]) || 0;
        const curr = parseInt(assessment[currKey]) || 0;
        const fill = document.getElementById(`water-fill-${i}`);
        if (!fill) continue;
        const startY = 20 + (80 * (1 - begin/5));
        const startH = 80 * (begin/5);
        const endY = 20 + (80 * (1 - curr/5));
        const endH = 80 * (curr/5);
        // Animate from begin to current
        let frame = 0, frames = 30;
        function animate() {
            frame++;
            const y = startY + (endY - startY) * (frame/frames);
            const h = startH + (endH - startH) * (frame/frames);
            fill.setAttribute('y', y);
            fill.setAttribute('height', h);
            if (frame < frames) requestAnimationFrame(animate);
        }
        animate();
    }
}

// Hook into portfolio-enhanced.js
(function() {
    // Wait for DOM and portfolio-enhanced.js to load
    function updateGaugesFromPortfolio() {
        const select = document.getElementById('student-select');
        if (!select) return;
        const studentName = select.value;
        if (!studentName) {
            renderWaterGauges(null);
            return;
        }
        // Use the same data processor as portfolio-enhanced.js
        if (window.SELDataProcessor) {
            const dataProcessor = new SELDataProcessor();
            const data = dataProcessor.loadData();
            const assessment = data.filter(entry => entry.name === studentName)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            renderWaterGauges(assessment);
        }
    }
    document.addEventListener('DOMContentLoaded', updateGaugesFromPortfolio);
    document.getElementById('student-select').addEventListener('change', updateGaugesFromPortfolio);
    // Also update when portfolio is updated
    window.renderWaterGauges = renderWaterGauges;
})(); 