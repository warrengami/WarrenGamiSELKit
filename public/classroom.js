// File: classroom.js
// Updated logic for the interactive Classroom Hub.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const resourceType = params.get('type');
    const resourceFile = params.get('file');

    const titleEl = document.getElementById('resource-title');
    const mainContentEl = document.getElementById('main-content');
    const controlPanelEl = document.getElementById('control-panel');

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

    // --- DICE MODE LOGIC ---
    async function setupDiceMode() {
        try {
            const doc = await fetchAndParse(resourceFile);
            titleEl.textContent = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Dice';

            // Extract prompts
            const scriptContent = doc.querySelector('script:not([src])')?.innerHTML;
            const promptsMatch = scriptContent.match(/const prompts = (\[[^\]]*\]);/s);
            if (!promptsMatch) throw new Error('Could not find prompts array in the resource file.');
            const prompts = eval(promptsMatch[1]);
            
            // Build 3D dice HTML
            mainContentEl.innerHTML = `
                <div class="dice-scene">
                    <div class="dice" id="interactive-dice">
                        ${prompts.slice(0, 6).map((prompt, i) => `<div class="face face-${i + 1}">${prompt}</div>`).join('')}
                    </div>
                </div>
                <div id="prompt-result"></div>
            `;
            
            // Add control button
            const rollBtn = document.createElement('button');
            rollBtn.textContent = '🎲 Roll the Dice';
            controlPanelEl.appendChild(rollBtn);
            
            const dice = document.getElementById('interactive-dice');
            const promptResultEl = document.getElementById('prompt-result');

            rollBtn.addEventListener('click', () => {
                if (rollBtn.disabled) return;
                rollBtn.disabled = true;
                promptResultEl.textContent = ''; // Clear previous result
                
                const randomFace = Math.floor(Math.random() * 6) + 1;
                dice.className = 'dice rolling'; // Start animation
                
                setTimeout(() => {
                    dice.className = `dice show-${randomFace}`; // Stop at the chosen face
                    const chosenPrompt = prompts[randomFace - 1];
                    promptResultEl.textContent = chosenPrompt;
                    rollBtn.disabled = false;
                }, 1500); // Duration of the roll animation
            });

        } catch (error) {
            handleError(error);
        }
    }

    // --- SCENARIO CARD MODE LOGIC ---
    async function setupScenarioMode() {
        try {
            const doc = await fetchAndParse(resourceFile);
            titleEl.textContent = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Scenario Cards';

            let scenarios = [];
            doc.querySelectorAll('.scenario-card-container').forEach(card => {
                const front = card.querySelector('.card-front');
                const back = card.querySelector('.card-back');
                if(front && back) {
                    scenarios.push({
                        title: front.querySelector('.card-title')?.textContent || '',
                        text: front.querySelector('.card-text')?.textContent || '',
                        questions: back.querySelector('.guiding-questions')?.innerHTML || ''
                    });
                }
            });

            if (scenarios.length === 0) { // Handle blank cards
                 scenarios.push({ title: 'Blank Card', text: 'Use this for your own scenario.', questions: '<li>What is the problem?</li><li>What are some solutions?</li>'});
            }

            let deck = [...scenarios];

            // Build card deck HTML
            mainContentEl.innerHTML = `
                <div class="deck-container">
                    <div class="card-deck" id="card-deck">
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                        <div class="card-back-design"></div>
                    </div>
                    <div class="drawn-card-wrapper" id="drawn-card-wrapper"></div>
                </div>
            `;
            
            // Add control button
            const drawBtn = document.createElement('button');
            drawBtn.textContent = 'Shuffle & Draw Card';
            controlPanelEl.appendChild(drawBtn);

            const deckEl = document.getElementById('card-deck');
            const drawnCardWrapper = document.getElementById('drawn-card-wrapper');

            drawBtn.addEventListener('click', () => {
                if (drawBtn.disabled) return;
                
                if (deck.length === 0) { // Reshuffle if deck is empty
                    deck = [...scenarios].sort(() => 0.5 - Math.random());
                    drawnCardWrapper.innerHTML = '<p>Deck reshuffled!</p>';
                    return;
                }

                drawBtn.disabled = true;
                deckEl.classList.add('shuffling');

                setTimeout(() => {
                    deckEl.classList.remove('shuffling');
                    const drawn = deck.pop(); // Draw card from the end
                    
                    drawnCardWrapper.innerHTML = `
                        <div class="drawn-card" id="current-card">
                            <div class="card-front">
                                <div class="card-title">${drawn.title}</div>
                                <p class="card-text">${drawn.text}</p>
                            </div>
                            <div class="card-back">
                                <div class="card-title">Guiding Questions</div>
                                <ul class="guiding-questions">${drawn.questions}</ul>
                            </div>
                        </div>
                    `;
                    
                    document.getElementById('current-card').addEventListener('click', function() {
                        this.classList.toggle('flipped');
                    });

                    if (deck.length === 0) {
                        drawBtn.textContent = 'Reshuffle Deck';
                    }
                    drawBtn.disabled = false;
                }, 500);
            });

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
