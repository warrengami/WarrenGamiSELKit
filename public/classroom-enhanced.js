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

    // HTML escaping function for security
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
            
            const allPrompts = JSON.parse(promptsMatch[1]);
            const dicePrompts = allPrompts.slice(0, 6); // Only use first 6 prompts for dice
            
            // Build enhanced 3D dice HTML
            const diceHTML = `
                <div class="dice-scene">
                    <div class="dice" id="interactive-dice">
                        ${dicePrompts.map((prompt, i) => `<div class="face face-${i + 1}">${escapeHtml(prompt)}</div>`).join('')}
                    </div>
                </div>
                <div id="prompt-result"></div>
            `;
            mainContentEl.innerHTML = diceHTML;
            
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
            

            
            // Add keyboard support
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !rollBtn.disabled) {
                    e.preventDefault();
                    rollBtn.click();
                }
            });

            // Basic roll function
            rollBtn.addEventListener('click', async () => {
                if (rollBtn.disabled) return;
                
                try {
                    // Disable buttons during roll
                    rollBtn.disabled = true;
                    promptResultEl.textContent = '';
                    
                    // Generate random face for the roll
                    const randomFace = Math.floor(Math.random() * 6) + 1;
                    
                    // Perform basic roll animation
                    await performBasicRoll(dice, randomFace);
                    showBasicResult(randomFace, promptResultEl, dicePrompts);
                    
                    // Re-enable buttons after animation
                    setTimeout(() => {
                        rollBtn.disabled = false;
                    }, 2000);
                } catch (error) {
                    console.error('Error during dice roll:', error);
                    rollBtn.disabled = false;
                    promptResultEl.textContent = 'Error rolling dice. Please try again.';
                }
            });
            
            // Basic roll function
            async function performBasicRoll(dice, targetFace) {
                return new Promise((resolve) => {
                    // Simple roll animation
                    dice.classList.add('rolling');
                    
                    setTimeout(() => {
                        dice.classList.remove('rolling');
                        setDiceFace(dice, targetFace);
                        resolve();
                    }, 1000);
                });
            }
            
            // Enhanced dice face setting
            function setDiceFace(dice, face) {
                // Remove all show-X classes first
                dice.classList.remove('show-1', 'show-2', 'show-3', 'show-4', 'show-5', 'show-6');
                // Add the correct show-X class
                dice.classList.add(`show-${face}`);
            }
            
            // Basic result display
            function showBasicResult(face, resultEl, prompts) {
                const prompt = prompts[face - 1];
                resultEl.textContent = prompt;
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

            // Cleanup function for proper memory management
            function cleanup() {
                stopTimer();
            }

            // Handle page unload to prevent memory leaks
            window.addEventListener('beforeunload', cleanup);

            // Sound function
            function playDiceSound() {
                // Create audio element for dice rolling sound
                const audio = new Audio('dice-roll-1.mp3');
                audio.volume = 0.3; // Set volume to 30%
                audio.play().catch(error => {
                    // Audio playback failed silently
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
                
                try {
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
                        try {
                            deckEl.classList.remove('shuffling');
                            const drawn = deck.pop();
                            
                            if (!drawn) {
                                throw new Error('No card available to draw');
                            }
                            
                            const cardHTML = `
                                <div class="drawn-card" id="current-card">
                                    <div class="card-inner">
                                        <div class="card-front ${escapeHtml(drawn.bgColorClass)}">
                                            <div class="card-title">${escapeHtml(drawn.title)}</div>
                                            <p class="card-text">${escapeHtml(drawn.text)}</p>
                                            <div class="card-tags">
                                                ${drawn.selCompetencies.map(comp => `<span class="sel-tag">${escapeHtml(comp)}</span>`).join('')}
                                                ${drawn.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                                            </div>
                                        </div>
                                        <div class="card-back ${escapeHtml(drawn.bgColorClass)}">
                                            <div class="card-title">Guiding Questions</div>
                                            <ul class="guiding-questions">${escapeHtml(drawn.questions)}</ul>
                                        </div>
                                    </div>
                                </div>
                            `;
                            drawnCardWrapper.innerHTML = cardHTML;
                            
                            const currentCard = document.getElementById('current-card');
                            if (currentCard) {
                                currentCard.addEventListener('click', function() {
                                    this.classList.toggle('flipped');
                                });
                            }
                            
                            deckCount.textContent = `${deck.length} cards remaining`;

                            if (deck.length === 0) {
                                drawBtn.textContent = 'Reshuffle Deck';
                            }
                        } catch (error) {
                            console.error('Error drawing card:', error);
                            drawnCardWrapper.innerHTML = '<p style="font-size: 1.5em; text-align: center; color: red;">Error drawing card. Please try again.</p>';
                        } finally {
                            drawBtn.disabled = false;
                        }
                    }, 500);
                } catch (error) {
                    console.error('Error in draw button handler:', error);
                    drawBtn.disabled = false;
                }
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

            // Cleanup function for scenario mode
            function cleanupScenario() {
                stopTimer();
            }

            // Handle page unload to prevent memory leaks
            window.addEventListener('beforeunload', cleanupScenario);

        } catch (error) {
            handleError(error);
        }
    }

    function handleError(error) {
        console.error('Error loading resource:', error);
        titleEl.textContent = 'Error';
        mainContentEl.innerHTML = '<p>Unable to load resource. Please try again or contact support if the problem persists.</p>';
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


