// Scenario Cards Classroom Mode JavaScript
// Handles all scenario card functionality in classroom mode

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const resourceFile = params.get('file');

    // Global variables
    let allScenarios = [];
    let filteredScenarios = [];
    let cardHistory = [];
    let remainingCards = 0;
    let currentTimer = null;

    // Initialize the classroom
    if (resourceFile) {
        setupScenarioMode();
    } else {
        showError('No scenario file specified');
    }

    // Setup scenario mode
    async function setupScenarioMode() {
        try {
            const response = await fetch(resourceFile);
            if (!response.ok) throw new Error(`Failed to fetch ${resourceFile}`);
            
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // Extract scenarios from the document
            const scenarios = extractScenariosFromDocument(doc);
            if (scenarios.length === 0) {
                throw new Error('No scenarios found in the document.');
            }

            // Initialize scenarios
            allScenarios = scenarios;
            filteredScenarios = [...scenarios];
            remainingCards = scenarios.length;
            cardHistory = [];

            // Update UI
            updateCardCounter();
            updatePageTitle(resourceFile);
            
            // Make functions globally available
            window.drawCard = drawCard;
            window.shuffleDeck = shuffleDeck;
            window.filterScenarios = filterScenarios;
            window.toggleHistory = toggleHistory;
            window.startTimer = startTimer;
            window.stopTimer = stopTimer;
            window.exitClassroom = exitClassroom;
            
        } catch (error) {
            console.error('Error setting up scenario mode:', error);
            showError('Failed to load scenario cards');
        }
    }

    // Extract scenarios from document
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
        
        console.log(`Extracted ${scenarios.length} scenarios from document`);
        return scenarios;
    }

    // Draw a card
    function drawCard() {
        if (!filteredScenarios || filteredScenarios.length === 0) {
            alert('No cards available. Try changing the filter or shuffling the deck.');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * filteredScenarios.length);
        const selectedScenario = filteredScenarios[randomIndex];
        
        // Remove from remaining cards
        filteredScenarios.splice(randomIndex, 1);
        remainingCards = filteredScenarios.length;
        
        // Add to history
        cardHistory.unshift(selectedScenario);
        if (cardHistory.length > 10) cardHistory.pop(); // Keep only last 10
        
        // Update display
        updateCardDisplay(selectedScenario);
        updateCardCounter();
        updateHistoryDisplay();
        
        // Auto-draw new card if filter is applied
        if (filteredScenarios.length === 0 && remainingCards > 0) {
            setTimeout(() => {
                if (confirm('No more cards match the current filter. Draw a new card?')) {
                    filteredScenarios = [...allScenarios];
                    remainingCards = filteredScenarios.length;
                    updateCardCounter();
                    drawCard();
                }
            }, 1000);
        }
    }

    // Update card display
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

    // Shuffle deck
    function shuffleDeck() {
        const cardDeck = document.getElementById('card-deck');
        cardDeck.classList.add('shuffling');
        
        setTimeout(() => {
            cardDeck.classList.remove('shuffling');
            filteredScenarios = [...allScenarios];
            remainingCards = filteredScenarios.length;
            updateCardCounter();
            
            // Hide drawn card, show deck
            document.getElementById('drawn-card-wrapper').style.display = 'none';
            cardDeck.style.display = 'block';
        }, 1200);
    }

    // Filter scenarios
    function filterScenarios() {
        const searchTerm = document.querySelector('.search-input').value.toLowerCase();
        const competencyFilter = document.querySelector('.filter-select').value;
        
        filteredScenarios = allScenarios.filter(scenario => {
            const matchesSearch = !searchTerm || 
                scenario.title.toLowerCase().includes(searchTerm) || 
                scenario.text.toLowerCase().includes(searchTerm);
            
            const matchesCompetency = !competencyFilter || 
                scenario.competency === competencyFilter;
            
            return matchesSearch && matchesCompetency;
        });
        
        remainingCards = filteredScenarios.length;
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

    // Update card counter
    function updateCardCounter() {
        const counter = document.getElementById('card-counter');
        if (counter) {
            counter.textContent = `Cards remaining: ${remainingCards}`;
        }
    }

    // Update history display
    function updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.innerHTML = cardHistory.map((scenario, index) => 
                `<div class="history-item">${index + 1}. ${escapeHtml(scenario.title)}</div>`
            ).join('');
        }
    }

    // Toggle history
    function toggleHistory() {
        const historyDiv = document.getElementById('card-history');
        if (historyDiv) {
            historyDiv.style.display = historyDiv.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Start timer
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

    // Stop timer
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

    // Update timer display
    function updateTimerDisplay(seconds) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const display = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = display;
        }
    }

    // Show timer notification
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

    // Extract tags from text
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

    // Update page title
    function updatePageTitle(filename) {
        const title = filename.replace('.html', '').replace(/([A-Z])/g, ' $1').trim();
        const pageTitle = document.getElementById('page-title');
        const currentPage = document.getElementById('current-page');
        
        if (pageTitle) pageTitle.textContent = `FeelReady - ${title}`;
        if (currentPage) currentPage.textContent = `FeelReady - ${title}`;
    }

    // Exit classroom
    function exitClassroom() {
        window.location.href = 'dashboard.html';
    }

    // Show error
    function showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="exitClassroom()" style="margin-top: 20px; padding: 10px 20px; background: var(--grounded-indigo); color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
                </div>
            `;
        }
    }

    // HTML escaping for security
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (currentTimer) {
            clearInterval(currentTimer);
        }
    });
}); 