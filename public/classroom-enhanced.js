// File: classroom.js
// Enhanced interactive Classroom Hub with physics-based dice and smart features

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const resourceType = params.get('type');
    const resourceFile = params.get('file');

    const titleEl = document.getElementById('resource-title');
    const mainContentEl = document.getElementById('main-content');
    const controlPanelEl = document.getElementById('control-panel');

    // Global variables for enhanced features
    let currentTimer = null;
    let discussionPrompts = [];

    if (!resourceFile) {
        titleEl.textContent = 'Error';
        mainContentEl.innerHTML = '<p>No resource specified. Please close this tab and select a resource from the dashboard.</p>';
        return;
    }

    // --- SHARED FUNCTION ---
    async function fetchAndParse(file) {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to fetch ${file}`);
        const htmlText = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(htmlText, 'text/html');
    }

    // --- ENHANCED DICE MODE LOGIC ---
    async function setupDiceMode() {
        try {
            const doc = await fetchAndParse(resourceFile);
            titleEl.textContent = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Dice';

            // Extract prompts
            const scriptContent = doc.querySelector('script:not([src])')?.innerHTML;
            if (!scriptContent) throw new Error('Could not find script content in the resource file.');
            
            // Look for prompts array in multiple formats
            let promptsMatch = scriptContent.match(/const prompts = (\[[\s\S]*?\]);/);
            if (!promptsMatch) {
                // Try alternative format
                promptsMatch = scriptContent.match(/const prompts\s*=\s*(\[[\s\S]*?\]);/);
            }
            if (!promptsMatch) throw new Error('Could not find prompts array in the resource file.');
            
            const allPrompts = eval(promptsMatch[1]);
            const dicePrompts = allPrompts.slice(0, 6); // Only use first 6 prompts for dice
            
            // Build enhanced 3D dice HTML
            mainContentEl.innerHTML = `
                <div class="dice-scene">
                    <div class="dice" id="interactive-dice">
                        ${dicePrompts.map((prompt, i) => `<div class="face face-${i + 1}">${prompt}</div>`).join('')}
                    </div>
                </div>
                <div id="prompt-result"></div>
            `;
            
            // Enhanced control buttons for dice
            const rollBtn = document.createElement('button');
            rollBtn.textContent = '🎲 Roll the Dice';
            rollBtn.className = 'enhanced-btn';
            controlPanelEl.appendChild(rollBtn);



            // Timer controls
            const timerBtn = document.createElement('button');
            timerBtn.textContent = '⏱️ Start Timer';
            timerBtn.className = 'enhanced-btn timer-btn';
            controlPanelEl.appendChild(timerBtn);
            
            const dice = document.getElementById('interactive-dice');
            const promptResultEl = document.getElementById('prompt-result');
            const timerSection = document.getElementById('timer-section');
            const timerDisplay = document.getElementById('timer-display');
            
            // Initialize enhanced dice roll
            if (window.enhancedDiceRoll) {
                window.enhancedDiceRoll.enhanceExistingDice();
            }
            
            // Add keyboard support
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !rollBtn.disabled) {
                    e.preventDefault();
                    rollBtn.click();
                }
            });

            // Enhanced roll function with Lottie-style animations
            rollBtn.addEventListener('click', async () => {
                if (rollBtn.disabled) return;
                
                // Disable buttons during roll
                rollBtn.disabled = true;
                promptResultEl.textContent = '';
                
                // Use enhanced dice roll if available
                if (window.enhancedDiceRoll && window.enhancedDiceRoll.isRolling === false) {
                    try {
                        await window.enhancedDiceRoll.performEnhancedRoll(dice, Math.floor(Math.random() * 6) + 1);
                        const randomFace = Math.floor(Math.random() * 6) + 1;
                        showEnhancedResult(randomFace, promptResultEl, dicePrompts);
                    } catch (error) {
                        console.log('Enhanced roll failed, using fallback:', error);
                        // Fallback to enhanced physics-based animation
                        const randomFace = Math.floor(Math.random() * 6) + 1;
                        const rollDuration = 2500 + Math.random() * 1000; // 2.5-3.5 seconds
                        
                        // Enhanced multi-phase animation
                        dice.classList.add('rolling', 'enhanced-tumble');
                        
                        // Add glow effect
                        dice.classList.add('glowing');
                        
                        setTimeout(() => {
                            dice.classList.remove('rolling', 'enhanced-tumble');
                            dice.classList.add('bouncing');
                            
                            setTimeout(() => {
                                dice.classList.remove('bouncing');
                                setDiceFace(dice, randomFace);
                                dice.classList.add('settling');
                                
                                setTimeout(() => {
                                    dice.classList.remove('settling', 'glowing');
                                    showEnhancedResult(randomFace, promptResultEl, dicePrompts);
                                    rollBtn.disabled = false;
                                }, 800);
                            }, 600);
                        }, rollDuration);
                    }
                } else {
                    // Fallback to enhanced physics-based animation
                    const randomFace = Math.floor(Math.random() * 6) + 1;
                    const rollDuration = 2500 + Math.random() * 1000; // 2.5-3.5 seconds
                    
                    // Enhanced multi-phase animation
                    dice.classList.add('rolling', 'enhanced-tumble');
                    
                    // Add glow effect
                    dice.classList.add('glowing');
                    
                    setTimeout(() => {
                        dice.classList.remove('rolling', 'enhanced-tumble');
                        dice.classList.add('bouncing');
                        
                        setTimeout(() => {
                            dice.classList.remove('bouncing');
                            setDiceFace(dice, randomFace);
                            dice.classList.add('settling');
                            
                            setTimeout(() => {
                                dice.classList.remove('settling', 'glowing');
                                showEnhancedResult(randomFace, promptResultEl, dicePrompts);
                                rollBtn.disabled = false;
                            }, 800);
                        }, 600);
                    }, rollDuration);
                }
                
                // Re-enable buttons after animation
                setTimeout(() => {
                    rollBtn.disabled = false;
                }, 3500);
            });
            
            // Enhanced dice face setting
            function setDiceFace(dice, face) {
                const transforms = {
                    1: 'rotateY(0deg)',
                    2: 'rotateY(-90deg)',
                    3: 'rotateY(-180deg)',
                    4: 'rotateY(90deg)',
                    5: 'rotateX(-90deg)',
                    6: 'rotateX(90deg)'
                };
                
                dice.style.transform = transforms[face];
            }
            
            // Enhanced result display with celebration
            function showEnhancedResult(face, resultEl, prompts) {
                const prompt = prompts[face - 1];
                
                // Create particle effect
                createParticleEffect(resultEl);
                
                // Show result with enhanced animation
                resultEl.style.opacity = '0';
                resultEl.style.transform = 'translateY(20px)';
                resultEl.textContent = prompt;
                
                setTimeout(() => {
                    resultEl.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    resultEl.style.opacity = '1';
                    resultEl.style.transform = 'translateY(0px)';
                    resultEl.classList.add('celebrating');
                    
                    setTimeout(() => {
                        resultEl.classList.remove('celebrating');
                    }, 1200);
                }, 200);
            }
            
            // Create particle effect
            function createParticleEffect(element) {
                const particles = document.createElement('div');
                particles.className = 'dice-particles';
                particles.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                `;
                
                // Create multiple particles
                for (let i = 0; i < 8; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.cssText = `
                        position: absolute;
                        width: 6px;
                        height: 6px;
                        background: radial-gradient(circle, #ffd23f 0%, #ff6b35 100%);
                        border-radius: 50%;
                        left: ${Math.random() * 100}%;
                        animation: particle-float 2.5s ease-out forwards;
                        animation-delay: ${Math.random() * 0.5}s;
                    `;
                    particles.appendChild(particle);
                }
                
                element.appendChild(particles);
                
                // Remove particles after animation
                setTimeout(() => {
                    particles.remove();
                }, 2500);
            }



            // Timer functionality
            timerBtn.addEventListener('click', () => {
                if (currentTimer) {
                    stopTimer();
                    timerBtn.textContent = '⏱️ Start Timer';
                    timerSection.style.display = 'none';
                } else {
                    startTimer();
                    timerBtn.textContent = '⏹️ Stop Timer';
                    timerSection.style.display = 'block';
                }
            });



            // Timer functions
            function startTimer() {
                const savedDuration = localStorage.getItem('timerDuration') || 180;
                let timeLeft = parseInt(savedDuration);
                currentTimer = setInterval(() => {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    if (timeLeft <= 0) {
                        stopTimer();
                        timerDisplay.textContent = "Time's up!";
                        timerSection.style.display = 'none';
                    }
                }, 1000);
            }

            function stopTimer() {
                if (currentTimer) {
                    clearInterval(currentTimer);
                    currentTimer = null;
                }
            }

            // Sound function
            function playDiceSound() {
                // Create audio element for dice rolling sound
                const audio = new Audio('dice-roll-1.mp3');
                audio.volume = 0.3; // Set volume to 30%
                audio.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            }

        } catch (error) {
            handleError(error);
        }
    }

    // --- ENHANCED SCENARIO CARD MODE LOGIC ---
    async function setupScenarioMode() {
        try {
            const doc = await fetchAndParse(resourceFile);
            titleEl.textContent = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Scenario Cards';

            let scenarios = [];
            const cardContainers = doc.querySelectorAll('.scenario-card-container');
            
            cardContainers.forEach((card, index) => {
                const front = card.querySelector('.card-front');
                const back = card.querySelector('.card-back');
                
                if(front && back) {
                    const colorClassMatch = front.className.match(/bg-\w+/);
                    const colorClass = colorClassMatch ? colorClassMatch[0] : '';

                    const title = front.querySelector('.card-title')?.textContent || '';
                    const text = front.querySelector('.card-text')?.textContent || '';
                    const questions = back.querySelector('.guiding-questions')?.innerHTML || '';

                    // Extract SEL competency from card content
                    const selCompetencies = extractSELCompetencies(title + ' ' + text);
                    const tags = extractTags(title + ' ' + text);

                    scenarios.push({
                        title: title,
                        text: text,
                        questions: questions,
                        bgColorClass: colorClass,
                        selCompetencies: selCompetencies,
                        tags: tags
                    });
                }
            });

            if (scenarios.length === 0) {
                 scenarios.push({ 
                     title: 'Blank Card', 
                     text: 'Use this for your own scenario.', 
                     questions: '<li>What is the problem?</li><li>What are some solutions?</li>', 
                     bgColorClass: '',
                     selCompetencies: ['Self-Awareness'],
                     tags: ['blank', 'template']
                 });
            }

            let deck = [...scenarios].sort(() => 0.5 - Math.random());

            // Build enhanced scenario card interface with search and filters
            mainContentEl.innerHTML = `
                <div class="scenario-controls">
                    <div class="search-filter-section">
                        <input type="text" id="scenario-search" placeholder="Search scenarios..." class="search-input">
                        <select id="sel-filter" class="filter-select">
                            <option value="">All SEL Competencies</option>
                            <option value="Self-Awareness">Self-Awareness</option>
                            <option value="Self-Management">Self-Management</option>
                            <option value="Social-Awareness">Social Awareness</option>
                            <option value="Relationship-Skills">Relationship Skills</option>
                            <option value="Responsible-Decision-Making">Responsible Decision-Making</option>
                        </select>
                    </div>
                    <div class="deck-info">
                        <span id="deck-count">${deck.length} cards remaining</span>
                    </div>
                </div>
                <div class="deck-container">
                    <div class="card-deck" id="card-deck">
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                    </div>
                    <div class="drawn-card-wrapper" id="drawn-card-wrapper"></div>
                </div>
            `;
            
            const drawBtn = document.createElement('button');
            drawBtn.textContent = 'Shuffle & Draw Card';
            drawBtn.className = 'enhanced-btn';
            controlPanelEl.appendChild(drawBtn);

            // Timer controls for scenarios
            const timerBtn = document.createElement('button');
            timerBtn.textContent = '⏱️ Start Timer';
            timerBtn.className = 'enhanced-btn timer-btn';
            controlPanelEl.appendChild(timerBtn);

            const deckEl = document.getElementById('card-deck');
            const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
            const searchInput = document.getElementById('scenario-search');
            const selFilter = document.getElementById('sel-filter');
            const deckCount = document.getElementById('deck-count');
            const timerSection = document.getElementById('timer-section');
            const timerDisplay = document.getElementById('timer-display');

            // Search and filter functionality
            searchInput.addEventListener('input', filterScenarios);
            selFilter.addEventListener('change', filterScenarios);
            
            // Initialize the deck with current filters
            filterScenarios();

            function filterScenarios() {
                const searchTerm = searchInput.value.toLowerCase();
                const selectedCompetency = selFilter.value;
                
                const filteredScenarios = scenarios.filter(scenario => {
                    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm) || 
                                        scenario.text.toLowerCase().includes(searchTerm) ||
                                        scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                    
                    const matchesCompetency = !selectedCompetency || 
                                           scenario.selCompetencies.includes(selectedCompetency);
                    
                    return matchesSearch && matchesCompetency;
                });
                
                // Update deck with filtered scenarios
                deck = [...filteredScenarios].sort(() => 0.5 - Math.random());
                deckCount.textContent = `${deck.length} cards remaining`;
            }

            // Extract SEL competencies from text
            function extractSELCompetencies(text) {
                const competencies = [];
                const lowerText = text.toLowerCase();
                
                if (lowerText.includes('emotion') || lowerText.includes('feel') || lowerText.includes('aware')) {
                    competencies.push('Self-Awareness');
                }
                if (lowerText.includes('calm') || lowerText.includes('control') || lowerText.includes('manage')) {
                    competencies.push('Self-Management');
                }
                if (lowerText.includes('other') || lowerText.includes('perspective') || lowerText.includes('empathy')) {
                    competencies.push('Social-Awareness');
                }
                if (lowerText.includes('friend') || lowerText.includes('relationship') || lowerText.includes('team')) {
                    competencies.push('Relationship-Skills');
                }
                if (lowerText.includes('decision') || lowerText.includes('choice') || lowerText.includes('problem')) {
                    competencies.push('Responsible-Decision-Making');
                }
                
                return competencies.length > 0 ? competencies : ['Self-Awareness'];
            }

            // Extract tags from text
            function extractTags(text) {
                const tags = [];
                const lowerText = text.toLowerCase();
                
                if (lowerText.includes('conflict')) tags.push('conflict');
                if (lowerText.includes('friendship')) tags.push('friendship');
                if (lowerText.includes('emotion')) tags.push('emotions');
                if (lowerText.includes('problem')) tags.push('problem-solving');
                if (lowerText.includes('team')) tags.push('teamwork');
                if (lowerText.includes('communication')) tags.push('communication');
                
                return tags;
            }

            drawBtn.addEventListener('click', () => {
                if (drawBtn.disabled) return;
                
                if (deck.length === 0) {
                    deck = [...scenarios].sort(() => 0.5 - Math.random());
                    drawnCardWrapper.innerHTML = '<p style="font-size: 1.5em; text-align: center;">Deck reshuffled!</p>';
                    drawBtn.textContent = 'Shuffle & Draw Card';
                    deckCount.textContent = `${deck.length} cards remaining`;
                    return;
                }

                drawBtn.disabled = true;
                deckEl.classList.add('shuffling');

                setTimeout(() => {
                    deckEl.classList.remove('shuffling');
                    const drawn = deck.pop();
                    
                    drawnCardWrapper.innerHTML = `
                        <div class="drawn-card" id="current-card">
                            <div class="card-front ${drawn.bgColorClass}">
                                <div class="card-title">${drawn.title}</div>
                                <p class="card-text">${drawn.text}</p>
                                <div class="card-tags">
                                    ${drawn.selCompetencies.map(comp => `<span class="sel-tag">${comp}</span>`).join('')}
                                    ${drawn.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                            <div class="card-back ${drawn.bgColorClass}">
                                <div class="card-title">Guiding Questions</div>
                                <ul class="guiding-questions">${drawn.questions}</ul>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('current-card').addEventListener('click', function() {
                        this.classList.toggle('flipped');
                    });
                    
                    deckCount.textContent = `${deck.length} cards remaining`;

                    if (deck.length === 0) {
                        drawBtn.textContent = 'Reshuffle Deck';
                    }
                    drawBtn.disabled = false;
                }, 500);
            });

            // Timer functionality for scenarios
            timerBtn.addEventListener('click', () => {
                if (currentTimer) {
                    stopTimer();
                    timerBtn.textContent = '⏱️ Start Timer';
                    timerSection.style.display = 'none';
                } else {
                    startTimer();
                    timerBtn.textContent = '⏹️ Stop Timer';
                    timerSection.style.display = 'block';
                }
            });



            // Timer functions (shared with dice)
            function startTimer() {
                const savedDuration = localStorage.getItem('timerDuration') || 180;
                let timeLeft = parseInt(savedDuration);
                currentTimer = setInterval(() => {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    if (timeLeft <= 0) {
                        stopTimer();
                        timerDisplay.textContent = "Time's up!";
                        timerSection.style.display = 'none';
                    }
                }, 1000);
            }

            function stopTimer() {
                if (currentTimer) {
                    clearInterval(currentTimer);
                    currentTimer = null;
                }
            }

        } catch (error) {
            handleError(error);
        }
    }

    function handleError(error) {
        console.error('Error loading resource:', error);
        titleEl.textContent = 'Error';
        mainContentEl.innerHTML = `<p>There was an error loading the resource: ${error.message}</p>`;
    }

    // --- ROUTER ---
    if (resourceType === 'dice') {
        setupDiceMode();
    } else if (resourceType === 'scenarios') {
        setupScenarioMode();
    } else {
        handleError(new Error('Unknown resource type specified.'));
    }
});

// Enhanced functionality for the new visual features

// Progress tracking and achievement system
let activityProgress = 0;
let achievements = [];

function updateProgress(increment = 1) {
    activityProgress += increment;
    
    // Show progress indicator
    const progressIndicator = document.getElementById('progress-indicator');
    const progressText = document.getElementById('progress-text');
    
    if (progressIndicator && progressText) {
        progressIndicator.style.display = 'block';
        progressText.textContent = `🎯 Progress: ${activityProgress} activities completed`;
        
        // Check for achievements
        checkAchievements();
    }
}

function checkAchievements() {
    const achievementBadge = document.getElementById('achievement-badge');
    
    if (activityProgress === 1 && !achievements.includes('first_activity')) {
        showAchievement('first_activity', '🌟 First Activity!');
    } else if (activityProgress === 5 && !achievements.includes('explorer')) {
        showAchievement('explorer', '🚀 Explorer Badge!');
    } else if (activityProgress === 10 && !achievements.includes('master')) {
        showAchievement('master', '👑 SEL Master!');
    }
}

function showAchievement(achievementId, message) {
    achievements.push(achievementId);
    const achievementBadge = document.getElementById('achievement-badge');
    
    if (achievementBadge) {
        achievementBadge.textContent = message;
        achievementBadge.style.display = 'inline-block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            achievementBadge.style.display = 'none';
        }, 3000);
    }
}

// Enhanced dice functionality with emotion-based colors
function setupEnhancedDiceMode() {
    // Override the original dice setup with enhanced features
    const originalSetupDiceMode = window.setupDiceMode;
    
    window.setupDiceMode = async function() {
        await originalSetupDiceMode();
        
        // Add emotion-based color coding
        const diceFaces = document.querySelectorAll('.dice .face');
        diceFaces.forEach((face, index) => {
            const emotionClass = getEmotionClass(index);
            face.classList.add(emotionClass);
        });
        
        // Add cultural celebration elements
        addCulturalElements();
        
        // Initialize progress tracking
        updateProgress();
    };
}

function getEmotionClass(index) {
    const emotions = ['joy', 'calm', 'excited', 'caring', 'confident', 'curious'];
    return `emotion-${emotions[index]}`;
}

function addCulturalElements() {
    // Add diverse cultural elements to the interface
    const header = document.querySelector('.classroom-header h1');
    if (header) {
        const culturalIcons = ['🌟', '🌍', '🤝', '❤️', '🌈', '🎉'];
        const randomIcon = culturalIcons[Math.floor(Math.random() * culturalIcons.length)];
        header.innerHTML = header.innerHTML.replace('🌟', randomIcon);
    }
}

// Enhanced scenario card functionality
function setupEnhancedScenarioMode() {
    // Override the original scenario setup with enhanced features
    const originalSetupScenarioMode = window.setupScenarioMode;
    
    window.setupScenarioMode = async function() {
        await originalSetupScenarioMode();
        
        // Add emotion-based color coding to cards
        const cards = document.querySelectorAll('.card-front, .card-back');
        cards.forEach(card => {
            const emotionClass = getRandomEmotionClass();
            card.classList.add(emotionClass);
        });
        
        // Add accessibility features
        addAccessibilityFeatures();
        
        // Initialize progress tracking
        updateProgress();
    };
}

function getRandomEmotionClass() {
    const emotions = ['joy', 'calm', 'excited', 'caring', 'confident', 'curious'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    return `emotion-${randomEmotion}`;
}

function addAccessibilityFeatures() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const drawnCard = document.querySelector('.drawn-card');
            if (drawnCard) {
                drawnCard.click();
            }
        }
    });
    
    // Add ARIA labels
    const cards = document.querySelectorAll('.drawn-card');
    cards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Click to flip scenario card');
    });
}

// Enhanced timer with visual feedback
function setupEnhancedTimer() {
    const timerSection = document.getElementById('timer-section');
    const timerDisplay = document.getElementById('timer-display');
    
    if (timerSection && timerDisplay) {
        // Add visual countdown animation
        timerSection.addEventListener('animationend', function() {
            if (timerDisplay.textContent === '00:00') {
                timerSection.style.animation = 'timerGlow 0.5s ease-in-out infinite';
            }
        });
    }
}

// High contrast mode toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    
    // Save preference
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Load saved preferences
    const isHighContrast = localStorage.getItem('highContrast') === 'true';
    if (isHighContrast) {
        document.body.classList.add('high-contrast');
    }
    
    // Setup enhanced modes
    setupEnhancedDiceMode();
    setupEnhancedScenarioMode();
    setupEnhancedTimer();
    
    // Add accessibility button
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
        const accessibilityBtn = document.createElement('button');
        accessibilityBtn.textContent = '👁️ High Contrast';
        accessibilityBtn.className = 'enhanced-btn';
        accessibilityBtn.onclick = toggleHighContrast;
        controlPanel.appendChild(accessibilityBtn);
    }
});

// Enhanced sound effects
function playEnhancedSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(type) {
        case 'dice_roll':
            playDiceRollSound(audioContext);
            break;
        case 'card_flip':
            playCardFlipSound(audioContext);
            break;
        case 'achievement':
            playAchievementSound(audioContext);
            break;
    }
}

function playDiceRollSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playCardFlipSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playAchievementSound(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Override original sound functions to use enhanced versions
const originalPlayDiceSound = window.playDiceSound;
window.playDiceSound = function() {
    if (originalPlayDiceSound) {
        originalPlayDiceSound();
    }
    playEnhancedSound('dice_roll');
};

// Enhanced card flip with sound
const originalCardFlip = window.cardFlip;
window.cardFlip = function() {
    if (originalCardFlip) {
        originalCardFlip();
    }
    playEnhancedSound('card_flip');
};
