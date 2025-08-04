// File: classroom.js
// Enhanced interactive Classroom Hub with physics-based dice and smart features

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const resourceType = params.get('type');
    const resourceFile = params.get('file');

    const titleEl = document.getElementById('resource-title');
    const mainContentEl = document.getElementById('main-content');
    const controlPanelEl = document.getElementById('control-panel');
    const breadcrumbEl = document.getElementById('breadcrumb-current');
    const categorySelectorEl = document.getElementById('category-selector');

    // Global variables for enhanced features
    let currentTimer = null;
    let discussionPrompts = [];
    let currentCategory = '';
    let cardHistory = [];
    let remainingCards = 0;

    // Dice category mappings
    const diceCategories = {
        'emotions': 'Emotions & Feelings Dice.html',
        'empathy': 'Empathy & Kindness Dice.html',
        'friendship': 'Friendship & Social Skills Dice.html',
        'coping': 'Coping Strategies Dice.html',
        'problem-solving': 'Problem Solving Dice.html',
        'self-awareness': 'Self-Awareness Dice.html'
    };

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
            const title = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Dice';
            titleEl.textContent = title;
            breadcrumbEl.textContent = title;

            // Show category selector for dice mode
            categorySelectorEl.style.display = 'block';
            setupCategorySelector();

            // Extract prompts from script content
            const scriptContent = doc.querySelector('script:not([src])')?.innerHTML;
            if (!scriptContent) throw new Error('Could not find script content in the resource file.');
            
            console.log('Script content found:', scriptContent.substring(0, 200) + '...');
            
            // Look for prompts array in multiple formats
            let promptsMatch = scriptContent.match(/const prompts\s*=\s*(\[[\s\S]*?\]);/);
            console.log('Prompts match result:', promptsMatch ? 'Found' : 'Not found');
            
            if (!promptsMatch) {
                // Try alternative format with different spacing
                promptsMatch = scriptContent.match(/const prompts\s*=\s*(\[[\s\S]*?\]);/);
                console.log('Alternative prompts match result:', promptsMatch ? 'Found' : 'Not found');
            }
            if (!promptsMatch) {
                // Try to extract prompts from the dice faces in the HTML
                const diceFaces = doc.querySelectorAll('.dice-face .prompt');
                console.log('Dice faces found:', diceFaces.length);
                if (diceFaces.length > 0) {
                    const dicePrompts = Array.from(diceFaces).map(face => face.textContent.trim());
                    console.log('Extracted prompts from HTML:', dicePrompts);
                    setupDiceWithPrompts(dicePrompts);
                    return;
                }
                throw new Error('Could not find prompts array or dice faces in the resource file.');
            }
            
            try {
                const allPrompts = JSON.parse(promptsMatch[1]);
                console.log('All prompts from array:', allPrompts);
                setupDiceWithPrompts(allPrompts); // Use all prompts, not just first 6
            } catch (parseError) {
                console.log('JSON parse error:', parseError);
                // If JSON parsing fails, try to extract from HTML faces
                const diceFaces = doc.querySelectorAll('.dice-face .prompt');
                if (diceFaces.length > 0) {
                    const dicePrompts = Array.from(diceFaces).map(face => face.textContent.trim());
                    console.log('Extracted prompts from HTML after parse error:', dicePrompts);
                    setupDiceWithPrompts(dicePrompts);
                } else {
                    throw new Error('Could not parse prompts array or find dice faces in the resource file.');
                }
            }
        } catch (error) {
            handleError(error);
        }
    }

    function setupCategorySelector() {
        const categoryButtons = categorySelectorEl.querySelectorAll('.category-btn');
        
        // Determine current category from filename
        const filename = resourceFile.toLowerCase();
        if (filename.includes('emotions')) currentCategory = 'emotions';
        else if (filename.includes('empathy')) currentCategory = 'empathy';
        else if (filename.includes('friendship')) currentCategory = 'friendship';
        else if (filename.includes('coping')) currentCategory = 'coping';
        else if (filename.includes('problem')) currentCategory = 'problem-solving';
        else if (filename.includes('self-awareness')) currentCategory = 'self-awareness';
        else currentCategory = 'emotions'; // default

        // Set active button
        categoryButtons.forEach(btn => {
            const category = btn.getAttribute('onclick')?.match(/switchCategory\('([^']+)'\)/)?.[1];
            if (category === currentCategory) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', async () => {
                const newCategory = btn.getAttribute('onclick')?.match(/switchCategory\('([^']+)'\)/)?.[1];
                if (newCategory && newCategory !== currentCategory) {
                    currentCategory = newCategory;
                    const newFile = diceCategories[newCategory];
                    
                    // Update active button
                    categoryButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Reload with new category
                    window.location.href = `classroom.html?type=dice&file=${encodeURIComponent(newFile)}`;
                }
            });
        });
    }

    function setupDiceWithPrompts(dicePrompts) {
        console.log('Setting up dice with prompts:', dicePrompts);
        
        // Store all prompts globally for random selection
        window.allDicePrompts = dicePrompts;
        
        // Update the existing dice faces with the prompts
        const dice = document.getElementById('dice');
        if (dice) {
            const faces = dice.querySelectorAll('.face');
            dicePrompts.forEach((prompt, index) => {
                if (faces[index]) {
                    const promptDisplay = faces[index].querySelector('.prompt-display');
                    if (promptDisplay) {
                        promptDisplay.textContent = prompt;
                    }
                }
            });
        }
        
        // Update the prompt result display
        const resultDiv = document.getElementById('prompt-result');
        if (resultDiv) {
            resultDiv.innerHTML = `<span>Roll 0 of ${dicePrompts.length} prompts</span>`;
        }
        
        // Make rollDice function globally available
        window.rollDice = rollDice;
        window.startTimer = startTimer;
        window.stopTimer = stopTimer;
        window.switchCategory = switchCategory;
    }

    function switchCategory(category) {
        const newFile = diceCategories[category];
        if (newFile) {
            window.location.href = `classroom.html?type=dice&file=${encodeURIComponent(newFile)}`;
        }
    }

    function rollDice() {
        console.log('Classroom rollDice called');
        const dice = document.getElementById('dice');
        const resultDiv = document.getElementById('prompt-result');
        
        console.log('Dice element:', dice);
        console.log('Window allDicePrompts:', window.allDicePrompts);
        
        if (!dice || !window.allDicePrompts) {
            console.log('Missing dice or prompts');
            return;
        }
        
        // Add rolling animation
        dice.classList.add('rolling', 'physics-roll');
        
        // Play sound if available
        playDiceSound();
        
        // Randomly select a prompt from all available prompts
        const randomIndex = Math.floor(Math.random() * window.allDicePrompts.length);
        const selectedPrompt = window.allDicePrompts[randomIndex];
        
        // Calculate which face to show (1-6)
        const faceNumber = (randomIndex % 6) + 1;
        
        // Stop rolling after animation
        setTimeout(() => {
            dice.classList.remove('rolling', 'physics-roll');
            dice.className = `dice show-${faceNumber}`;
            
            // Show result
            if (resultDiv) {
                resultDiv.innerHTML = `<span>${selectedPrompt}</span>`;
            }
            
            // Add bounce effect
            setTimeout(() => {
                dice.classList.add('bounce');
                setTimeout(() => {
                    dice.classList.remove('bounce');
                    dice.classList.add('settled');
                    setTimeout(() => dice.classList.remove('settled'), 500);
                }, 300);
            }, 100);
        }, 2500);
    }

    function startTimer() {
        const savedDuration = localStorage.getItem('timerDuration') || 60;
        const duration = parseInt(savedDuration);
        
        if (currentTimer) {
            clearInterval(currentTimer);
        }
        
        let timeLeft = duration;
        const timerDisplay = document.getElementById('timer-display');
        const timerSection = document.getElementById('timer-section');
        
        if (timerSection) {
            timerSection.style.display = 'block';
        }
        
        updateTimerDisplay(timeLeft);
        
        currentTimer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                stopTimer();
                showTimerNotification();
            }
        }, 1000);
    }

    function stopTimer() {
        if (currentTimer) {
            clearInterval(currentTimer);
            currentTimer = null;
        }
        
        const timerSection = document.getElementById('timer-section');
        if (timerSection) {
            timerSection.style.display = 'none';
        }
    }

    function updateTimerDisplay(seconds) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const display = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = display;
        }
    }

    function showTimerNotification() {
        const notification = document.getElementById('timer-notification');
        if (notification) {
            notification.style.display = 'block';
            
            // Play notification sound if available
            const audio = new Audio('dice-roll-1.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    function playDiceSound() {
        const audio = new Audio('dice-roll-1.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    // --- ENHANCED SCENARIO CARD MODE ---
    async function setupScenarioMode() {
        try {
            const doc = await fetchAndParse(resourceFile);
            const title = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Scenario Cards';
            titleEl.textContent = title;
            breadcrumbEl.textContent = title;

            // Hide category selector for scenario mode
            categorySelectorEl.style.display = 'none';

            // Extract scenarios from the document
            const scenarios = extractScenariosFromDocument(doc);
            if (scenarios.length === 0) {
                throw new Error('No scenarios found in the document.');
            }

            remainingCards = scenarios.length;
            cardHistory = [];

            // Build scenario card interface
            const scenarioHTML = `
                <div class="scenario-controls">
                    <div class="search-filter-section">
                        <input type="text" class="search-input" placeholder="Search scenarios..." onkeyup="filterScenarios()">
                        <select class="filter-select" onchange="filterScenarios()">
                            <option value="">All Competencies</option>
                            <option value="self-awareness">Self-Awareness</option>
                            <option value="self-management">Self-Management</option>
                            <option value="social-awareness">Social Awareness</option>
                            <option value="relationship-skills">Relationship Skills</option>
                            <option value="responsible-decision-making">Responsible Decision-Making</option>
                        </select>
                    </div>
                    <div class="deck-info">
                        <div class="card-counter" id="card-counter">
                            Cards remaining: ${remainingCards}
                        </div>
                    </div>
                </div>
                <div class="deck-container">
                    <div class="card-deck" id="card-deck">
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                    </div>
                    <div class="drawn-card-wrapper" id="drawn-card-wrapper" style="display: none;">
                        <div class="drawn-card" id="drawn-card">
                            <div class="card-front" id="card-front"></div>
                            <div class="card-back" id="card-back"></div>
                        </div>
                    </div>
                </div>
                <div class="card-history" id="card-history" style="display: none;">
                    <h4>Recently Drawn Cards:</h4>
                    <div id="history-list"></div>
                </div>
            `;
            
            mainContentEl.innerHTML = scenarioHTML;
            
            // Build control panel
            const controlHTML = `
                <button class="enhanced-btn" onclick="drawCard()">📄 Draw Card</button>
                <button class="enhanced-btn" onclick="shuffleDeck()">🔀 Shuffle</button>
                <button class="enhanced-btn timer-btn" onclick="startTimer()">⏱️ Start Timer</button>
                <button class="enhanced-btn" onclick="stopTimer()">⏹️ Stop Timer</button>
                <button class="enhanced-btn" onclick="toggleHistory()">📋 History</button>
            `;
            controlPanelEl.innerHTML = controlHTML;
            
            // Store scenarios globally
            window.allScenarios = scenarios;
            window.filteredScenarios = [...scenarios];
            
            // Make functions globally available
            window.drawCard = drawCard;
            window.shuffleDeck = shuffleDeck;
            window.filterScenarios = filterScenarios;
            window.toggleHistory = toggleHistory;
            window.startTimer = startTimer;
            window.stopTimer = stopTimer;
            
            // Initialize enhanced features if available
            if (typeof initEnhancedScenarioFeatures === 'function') {
                initEnhancedScenarioFeatures();
            }
            
        } catch (error) {
            handleError(error);
        }
    }

    function extractScenariosFromDocument(doc) {
        const scenarios = [];
        
        // Look for scenario elements with the correct structure
        const scenarioElements = doc.querySelectorAll('.scenario-card-container');
        
        scenarioElements.forEach((element, index) => {
            const cardFront = element.querySelector('.card-front');
            const cardBack = element.querySelector('.card-back');
            
            if (cardFront) {
                const titleElement = cardFront.querySelector('.card-title');
                const textElement = cardFront.querySelector('.card-text, p');
                
                const title = titleElement?.textContent || `Scenario ${index + 1}`;
                const text = textElement?.textContent || cardFront.textContent;
                
                // Determine competency from background class
                let competency = 'general';
                if (cardFront.classList.contains('bg-self-awareness')) competency = 'self-awareness';
                else if (cardFront.classList.contains('bg-self-management')) competency = 'self-management';
                else if (cardFront.classList.contains('bg-social-awareness')) competency = 'social-awareness';
                else if (cardFront.classList.contains('bg-relationship-skills')) competency = 'relationship-skills';
                else if (cardFront.classList.contains('bg-responsible-decision')) competency = 'responsible-decision-making';
                
                // Extract guiding questions from card back
                let guidingQuestions = [];
                if (cardBack) {
                    const questionsList = cardBack.querySelector('.guiding-questions');
                    if (questionsList) {
                        const questions = questionsList.querySelectorAll('li');
                        guidingQuestions = Array.from(questions).map(q => q.textContent.trim());
                    }
                }
                
                scenarios.push({
                    title: title.trim(),
                    text: text.trim(),
                    competency: competency,
                    tags: extractTags(text),
                    guidingQuestions: guidingQuestions
                });
            }
        });
        
        // If no scenarios found with scenario-card-container, try alternative selectors
        if (scenarios.length === 0) {
            const alternativeElements = doc.querySelectorAll('.scenario, .card, [data-scenario]');
            
            alternativeElements.forEach((element, index) => {
                const title = element.querySelector('.title, .card-title, h3, h4')?.textContent || `Scenario ${index + 1}`;
                const text = element.querySelector('.text, .card-text, p')?.textContent || element.textContent;
                const competency = element.dataset.competency || element.className.match(/self-awareness|self-management|social-awareness|relationship-skills|responsible-decision-making/)?.[0] || 'general';
                
                scenarios.push({
                    title: title.trim(),
                    text: text.trim(),
                    competency: competency,
                    tags: extractTags(text)
                });
            });
        }
        
        // If still no scenarios found, try to extract from script
        if (scenarios.length === 0) {
            const scriptContent = doc.querySelector('script:not([src])')?.innerHTML;
            if (scriptContent) {
                const scenariosMatch = scriptContent.match(/const scenarios\s*=\s*(\[[\s\S]*?\]);/);
                if (scenariosMatch) {
                    try {
                        const scriptScenarios = JSON.parse(scenariosMatch[1]);
                        return scriptScenarios.map((scenario, index) => ({
                            title: scenario.title || `Scenario ${index + 1}`,
                            text: scenario.text || scenario,
                            competency: scenario.competency || 'general',
                            tags: extractTags(scenario.text || scenario)
                        }));
                    } catch (e) {
                        console.log('Failed to parse scenarios from script:', e);
                    }
                }
            }
        }
        
        console.log(`Extracted ${scenarios.length} scenarios from document`);
        return scenarios;
    }

    function drawCard() {
        if (!window.filteredScenarios || window.filteredScenarios.length === 0) {
            alert('No cards available. Try changing the filter or shuffling the deck.');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * window.filteredScenarios.length);
        const selectedScenario = window.filteredScenarios[randomIndex];
        
        // Remove from remaining cards
        window.filteredScenarios.splice(randomIndex, 1);
        remainingCards = window.filteredScenarios.length;
        
        // Add to history
        cardHistory.unshift(selectedScenario);
        if (cardHistory.length > 10) cardHistory.pop(); // Keep only last 10
        
        // Update display
        updateCardDisplay(selectedScenario);
        updateCardCounter();
        updateHistoryDisplay();
        
        // Auto-draw new card if filter is applied
        if (window.filteredScenarios.length === 0 && remainingCards > 0) {
            setTimeout(() => {
                if (confirm('No more cards match the current filter. Draw a new card?')) {
                    window.filteredScenarios = [...window.allScenarios];
                    remainingCards = window.filteredScenarios.length;
                    updateCardCounter();
                    drawCard();
                }
            }, 1000);
        }
    }

    function updateCardDisplay(scenario) {
        const cardDeck = document.getElementById('card-deck');
        const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
        const cardFront = document.getElementById('card-front');
        const cardBack = document.getElementById('card-back');
        
        // Hide deck, show drawn card
        cardDeck.style.display = 'none';
        drawnCardWrapper.style.display = 'block';
        
        // Set card content
        cardFront.innerHTML = `
            <div class="card-title">${escapeHtml(scenario.title)}</div>
            <div class="card-text">${escapeHtml(scenario.text)}</div>
            <div class="card-tags">
                <span class="sel-tag">${scenario.competency.replace('-', ' ')}</span>
                ${scenario.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        
        cardBack.innerHTML = `
            <div class="card-title">Guiding Questions</div>
            <ul class="guiding-questions">
                ${scenario.guidingQuestions && scenario.guidingQuestions.length > 0 
                    ? scenario.guidingQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')
                    : `<li>How do you think the person in this scenario feels?</li>
                       <li>What might have caused this situation?</li>
                       <li>What could be done to help or improve the situation?</li>
                       <li>Have you ever been in a similar situation?</li>
                       <li>What would you do differently?</li>`
                }
            </ul>
        `;
        
        // Add click to flip functionality
        const drawnCard = document.getElementById('drawn-card');
        drawnCard.onclick = () => {
            drawnCard.classList.toggle('flipped');
        };
    }

    function shuffleDeck() {
        const cardDeck = document.getElementById('card-deck');
        cardDeck.classList.add('shuffling');
        
        setTimeout(() => {
            cardDeck.classList.remove('shuffling');
            window.filteredScenarios = [...window.allScenarios];
            remainingCards = window.filteredScenarios.length;
            updateCardCounter();
            
            // Hide drawn card, show deck
            document.getElementById('drawn-card-wrapper').style.display = 'none';
            cardDeck.style.display = 'block';
        }, 1200);
    }

    function filterScenarios() {
        // Use enhanced filter function if available
        if (typeof enhancedFilterScenarios === 'function') {
            enhancedFilterScenarios();
        } else {
            // Fallback to original implementation
            const searchTerm = document.querySelector('.search-input').value.toLowerCase();
            const competencyFilter = document.querySelector('.filter-select').value;
            
            window.filteredScenarios = window.allScenarios.filter(scenario => {
                const matchesSearch = !searchTerm || 
                    scenario.title.toLowerCase().includes(searchTerm) || 
                    scenario.text.toLowerCase().includes(searchTerm);
                
                const matchesCompetency = !competencyFilter || 
                    scenario.competency === competencyFilter;
                
                return matchesSearch && matchesCompetency;
            });
            
            remainingCards = window.filteredScenarios.length;
            updateCardCounter();
            
            // Auto-draw new card if current card doesn't match filter
            const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
            if (drawnCardWrapper.style.display !== 'none' && remainingCards > 0) {
                setTimeout(() => {
                    if (confirm('The current card no longer matches the filter. Draw a new card?')) {
                        drawCard();
                    }
                }, 500);
            }
        }
    }

    function updateCardCounter() {
        // Use enhanced counter function if available
        if (typeof updateEnhancedCardCounter === 'function') {
            updateEnhancedCardCounter();
        } else {
            // Fallback to original implementation
            const counter = document.getElementById('card-counter');
            if (counter) {
                counter.textContent = `Cards remaining: ${remainingCards}`;
            }
        }
    }

    function updateHistoryDisplay() {
        // Use enhanced history function if available
        if (typeof updateEnhancedHistoryDisplay === 'function') {
            updateEnhancedHistoryDisplay();
        } else {
            // Fallback to original implementation
            const historyList = document.getElementById('history-list');
            if (historyList) {
                historyList.innerHTML = cardHistory.map((scenario, index) => 
                    `<div class="history-item">${index + 1}. ${escapeHtml(scenario.title)}</div>`
                ).join('');
            }
        }
    }

    function toggleHistory() {
        const historyDiv = document.getElementById('card-history');
        if (historyDiv) {
            historyDiv.style.display = historyDiv.style.display === 'none' ? 'block' : 'none';
        }
    }

    function extractSELCompetencies(text) {
        const competencies = [];
        const competencyKeywords = {
            'self-awareness': ['feel', 'emotion', 'recognize', 'understand', 'aware'],
            'self-management': ['calm', 'control', 'manage', 'cope', 'regulate'],
            'social-awareness': ['empathy', 'perspective', 'understand others', 'compassion'],
            'relationship-skills': ['friend', 'communicate', 'cooperate', 'conflict', 'help'],
            'responsible-decision-making': ['choice', 'decision', 'consequence', 'problem', 'solve']
        };
        
        const lowerText = text.toLowerCase();
        Object.entries(competencyKeywords).forEach(([competency, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                competencies.push(competency);
            }
        });
        
        return competencies;
    }

    function extractTags(text) {
        const tags = [];
        const tagKeywords = {
            'emotions': ['happy', 'sad', 'angry', 'excited', 'worried', 'frustrated'],
            'friendship': ['friend', 'play', 'share', 'help', 'kind'],
            'conflict': ['fight', 'argue', 'disagree', 'problem', 'conflict'],
            'school': ['classroom', 'teacher', 'student', 'homework', 'school'],
            'family': ['parent', 'sibling', 'family', 'home']
        };
        
        const lowerText = text.toLowerCase();
        Object.entries(tagKeywords).forEach(([tag, keywords]) => {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                tags.push(tag);
            }
        });
        
        return tags;
    }

    function cleanupScenario() {
        if (currentTimer) {
            clearInterval(currentTimer);
        }
    }

    function handleError(error) {
        console.error('Error in classroom mode:', error);
        titleEl.textContent = 'Error';
        mainContentEl.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>Something went wrong</h2>
                <p>We couldn't load the requested resource. Please try again or contact support.</p>
                <button onclick="window.history.back()" style="margin-top: 20px; padding: 10px 20px; background: var(--midnight-blue); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
            </div>
        `;
    }

    // Initialize based on resource type
    if (resourceType === 'dice') {
        setupDiceMode();
    } else if (resourceType === 'scenarios') {
        setupScenarioMode();
    } else {
        // Auto-detect based on file content
        if (resourceFile.toLowerCase().includes('dice')) {
            setupDiceMode();
        } else {
            setupScenarioMode();
        }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (currentTimer) {
            clearInterval(currentTimer);
        }
    });
});
