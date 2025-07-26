// File: water-gauges.js
// Professional UX Design for Water Level Gauges

const SKILL_LABELS = {
    'namingEmotions': 'Naming Emotions',
    'calming': 'Calming Down', 
    'understandingOthers': 'Understanding Others',
    'solvingConflicts': 'Solving Conflicts'
};

const SKILL_KEYS = ['namingEmotions', 'calming', 'understandingOthers', 'solvingConflicts'];

// Professional color palette with gradients
function getWaterColor(score) {
    const numScore = parseInt(score);
    if (numScore >= 4) {
        return {
            fill: 'url(#excellent-gradient)',
            stroke: '#10b981',
            glow: '#10b981'
        };
    } else if (numScore >= 3) {
        return {
            fill: 'url(#good-gradient)',
            stroke: '#3b82f6',
            glow: '#3b82f6'
        };
    } else if (numScore >= 2) {
        return {
            fill: 'url(#developing-gradient)',
            stroke: '#f59e0b',
            glow: '#f59e0b'
        };
    } else {
        return {
            fill: 'url(#needs-support-gradient)',
            stroke: '#ef4444',
            glow: '#ef4444'
        };
    }
}

function renderWaterGauges(assessment) {
    const container = document.getElementById('water-gauges');
    if (!container) return;

    // Create professional container with grid layout
    container.innerHTML = `
        <div class="gauges-container">
            <div class="gauges-grid">
                ${SKILL_KEYS.map(skill => {
                    const currentScore = assessment[`${skill}_N`] || 0;
                    const beginningScore = assessment[`${skill}_B`] || 0;
                    const growth = currentScore - beginningScore;
                    const colors = getWaterColor(currentScore);
                    
                    return `
                        <div class="gauge-card">
                            <div class="gauge-header">
                                <h3 class="skill-title">${SKILL_LABELS[skill]}</h3>
                                <div class="score-display">
                                    <span class="current-score">${currentScore}/5</span>
                                    ${growth > 0 ? `<span class="growth-indicator positive">+${growth}</span>` : ''}
                                </div>
                            </div>
                            <div class="gauge-wrapper">
                                <svg class="water-gauge" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="excellent-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                                        </linearGradient>
                                        <linearGradient id="good-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
                                        </linearGradient>
                                        <linearGradient id="developing-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
                                        </linearGradient>
                                        <linearGradient id="needs-support-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                            <feMerge> 
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    
                                    <!-- Glass container with professional styling -->
                                    <rect x="10" y="10" width="100" height="180" rx="50" ry="50" 
                                          fill="none" stroke="#e5e7eb" stroke-width="2" 
                                          opacity="0.3"/>
                                    
                                    <!-- Inner glass effect -->
                                    <rect x="15" y="15" width="90" height="170" rx="45" ry="45" 
                                          fill="url(#glass-gradient)" stroke="none" opacity="0.1"/>
                                    
                                    <!-- Beginning water level (subtle) -->
                                    <rect x="20" y="${180 - (beginningScore * 30)}" width="80" 
                                          height="${beginningScore * 30}" rx="40" ry="40"
                                          fill="url(#beginning-gradient)" opacity="0.3"/>
                                    
                                    <!-- Current water level with animation -->
                                    <rect class="current-water" x="20" y="${180 - (currentScore * 30)}" 
                                          width="80" height="${currentScore * 30}" rx="40" ry="40"
                                          fill="${colors.fill}" stroke="${colors.stroke}" 
                                          stroke-width="1" filter="url(#glow)"
                                          style="animation: waterRise 1.5s ease-out;"/>
                                    
                                    <!-- Water surface effect -->
                                    <ellipse cx="60" cy="${180 - (currentScore * 30)}" rx="35" ry="8" 
                                             fill="${colors.fill}" opacity="0.8"/>
                                    
                                    <!-- Bubbles for visual interest -->
                                    ${currentScore > 0 ? `
                                        <circle cx="45" cy="${185 - (currentScore * 30)}" r="2" 
                                                fill="white" opacity="0.6">
                                            <animate attributeName="cy" values="${185 - (currentScore * 30)};${175 - (currentScore * 30)}" 
                                                     dur="2s" repeatCount="indefinite"/>
                                        </circle>
                                        <circle cx="75" cy="${185 - (currentScore * 30)}" r="1.5" 
                                                fill="white" opacity="0.4">
                                            <animate attributeName="cy" values="${185 - (currentScore * 30)};${175 - (currentScore * 30)}" 
                                                     dur="2.5s" repeatCount="indefinite"/>
                                        </circle>
                                    ` : ''}
                                </svg>
                            </div>
                            <div class="gauge-footer">
                                <div class="skill-level">
                                    <span class="level-label">${getLevelLabel(currentScore)}</span>
                                </div>
                                ${growth !== 0 ? `
                                    <div class="growth-info">
                                        <span class="growth-text ${growth > 0 ? 'positive' : 'negative'}">
                                            ${growth > 0 ? '↗' : '↘'} ${Math.abs(growth)} point${Math.abs(growth) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        .gauges-container {
            padding: 2rem;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .gauges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .gauge-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid #e2e8f0;
        }
        
        .gauge-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        
        .gauge-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .skill-title {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            font-size: 1.1rem;
            color: #1e293b;
            margin: 0;
        }
        
        .score-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .current-score {
            font-weight: 700;
            font-size: 1.2rem;
            color: #0f172a;
        }
        
        .growth-indicator {
            background: #10b981;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .gauge-wrapper {
            display: flex;
            justify-content: center;
            margin: 1rem 0;
        }
        
        .water-gauge {
            width: 120px;
            height: 200px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }
        
        .gauge-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
        }
        
        .level-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .growth-info {
            display: flex;
            align-items: center;
        }
        
        .growth-text {
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .growth-text.positive {
            color: #10b981;
        }
        
        .growth-text.negative {
            color: #ef4444;
        }
        
        @keyframes waterRise {
            from {
                height: 0;
                y: 180;
            }
            to {
                height: var(--final-height);
                y: var(--final-y);
            }
        }
        
        @media (max-width: 768px) {
            .gauges-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .gauge-card {
                padding: 1rem;
            }
        }
    `;
    
    if (!document.getElementById('water-gauge-styles')) {
        style.id = 'water-gauge-styles';
        document.head.appendChild(style);
    }
}

function getLevelLabel(score) {
    const numScore = parseInt(score);
    if (numScore >= 4) return 'Excellent';
    if (numScore >= 3) return 'Good';
    if (numScore >= 2) return 'Developing';
    return 'Needs Support';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const studentSelect = document.getElementById('student-select');
    if (studentSelect) {
        studentSelect.addEventListener('change', () => {
            const selectedStudent = studentSelect.value;
            if (selectedStudent) {
                const dataProcessor = new SELDataProcessor();
                const data = dataProcessor.loadData();
                const studentData = data.find(entry => entry.name === selectedStudent);
                if (studentData) {
                    renderWaterGauges(studentData);
                }
            }
        });
    }
});

// Make function globally available
window.renderWaterGauges = renderWaterGauges; 