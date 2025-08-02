// Enhanced Scenario Card Functionality
// Provides improved filter behavior, card tracking, and timer notifications

// Global variables for enhanced scenario features
let currentScenario = null;
let filteredScenarios = [];
let allScenarios = [];
let cardHistory = [];
let remainingCards = 0;
let currentTimer = null;
let timerSeconds = 0;

// Enhanced filter function with auto-refresh
function enhancedFilterScenarios() {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const competencyFilter = document.querySelector('.filter-select')?.value || '';
    
    // Filter scenarios
    filteredScenarios = allScenarios.filter(scenario => {
        const matchesSearch = !searchTerm || 
            scenario.title.toLowerCase().includes(searchTerm) || 
            scenario.text.toLowerCase().includes(searchTerm);
        
        const matchesCompetency = !competencyFilter || 
            scenario.competency === competencyFilter;
        
        return matchesSearch && matchesCompetency;
    });
    
    remainingCards = filteredScenarios.length;
    updateEnhancedCardCounter();
    
    // Auto-refresh current card if it doesn't match filter
    if (currentScenario && !filteredScenarios.includes(currentScenario)) {
        autoRefreshCard();
    }
    
    // Show filter status
    showFilterStatus();
}

// Auto-refresh card without confirmation
function autoRefreshCard() {
    if (filteredScenarios.length > 0) {
        // Hide current card with animation
        const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
        if (drawnCardWrapper) {
            drawnCardWrapper.style.opacity = '0';
            setTimeout(() => {
                drawNewCard();
                drawnCardWrapper.style.opacity = '1';
            }, 300);
        }
    } else {
        // No cards match filter - hide current card
        hideCurrentCard();
    }
}

// Draw new card from filtered scenarios
function drawNewCard() {
    if (filteredScenarios.length === 0) {
        showNoCardsMessage();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredScenarios.length);
    currentScenario = filteredScenarios[randomIndex];
    
    // Remove from filtered scenarios to avoid duplicates
    filteredScenarios.splice(randomIndex, 1);
    remainingCards = filteredScenarios.length;
    
    updateCardDisplay(currentScenario);
    addToHistory(currentScenario);
    updateEnhancedCardCounter();
    
    // Show card with animation
    const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
    if (drawnCardWrapper) {
        drawnCardWrapper.style.display = 'block';
        drawnCardWrapper.style.opacity = '1';
    }
}

// Hide current card
function hideCurrentCard() {
    const drawnCardWrapper = document.getElementById('drawn-card-wrapper');
    if (drawnCardWrapper) {
        drawnCardWrapper.style.display = 'none';
    }
    currentScenario = null;
}

// Show message when no cards match filter
function showNoCardsMessage() {
    const mainContent = document.getElementById('main-content');
    const noCardsHTML = `
        <div class="no-cards-message">
            <div class="no-cards-icon">📭</div>
            <h3>No cards match your filter</h3>
            <p>Try adjusting your search or competency filter to see more cards.</p>
            <button class="enhanced-btn" onclick="resetFilters()">Reset Filters</button>
        </div>
    `;
    
    // Insert after scenario controls
    const scenarioControls = document.querySelector('.scenario-controls');
    if (scenarioControls) {
        scenarioControls.insertAdjacentHTML('afterend', noCardsHTML);
    }
}

// Reset all filters
function resetFilters() {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = '';
    
    // Remove no cards message
    const noCardsMessage = document.querySelector('.no-cards-message');
    if (noCardsMessage) noCardsMessage.remove();
    
    // Reapply filters
    enhancedFilterScenarios();
}

// Show filter status
function showFilterStatus() {
    const statusElement = document.getElementById('filter-status');
    if (!statusElement) {
        const statusHTML = '<div id="filter-status" class="filter-status"></div>';
        const searchSection = document.querySelector('.search-filter-section');
        if (searchSection) {
            searchSection.insertAdjacentHTML('afterend', statusHTML);
        }
    }
    
    const statusEl = document.getElementById('filter-status');
    if (statusEl) {
        const totalCards = allScenarios.length;
        const filteredCount = filteredScenarios.length;
        
        if (filteredCount < totalCards) {
            statusEl.innerHTML = `
                <span class="filter-info">
                    📊 Showing ${filteredCount} of ${totalCards} cards
                </span>
            `;
            statusEl.style.display = 'block';
        } else {
            statusEl.style.display = 'none';
        }
    }
}

// Enhanced card counter with more details
function updateEnhancedCardCounter() {
    const counter = document.getElementById('card-counter');
    if (counter) {
        const totalCards = allScenarios.length;
        const drawnCount = cardHistory.length;
        
        counter.innerHTML = `
            <div class="counter-details">
                <div class="counter-main">📄 ${remainingCards} cards remaining</div>
                <div class="counter-secondary">
                    ${drawnCount} drawn • ${totalCards} total
                </div>
            </div>
        `;
    }
}

// Enhanced history tracking
function addToHistory(scenario) {
    cardHistory.unshift({
        ...scenario,
        timestamp: new Date().toLocaleTimeString(),
        filterContext: getCurrentFilterContext()
    });
    
    // Keep only last 10 cards in history
    if (cardHistory.length > 10) {
        cardHistory = cardHistory.slice(0, 10);
    }
    
    updateEnhancedHistoryDisplay();
}

// Get current filter context
function getCurrentFilterContext() {
    const searchTerm = document.querySelector('.search-input')?.value || '';
    const competencyFilter = document.querySelector('.filter-select')?.value || '';
    
    return {
        search: searchTerm,
        competency: competencyFilter
    };
}

// Enhanced history display
function updateEnhancedHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = cardHistory.map((scenario, index) => `
            <div class="history-item">
                <div class="history-title">${index + 1}. ${escapeHtml(scenario.title)}</div>
                <div class="history-meta">
                    <span class="history-time">${scenario.timestamp}</span>
                    <span class="history-competency">${scenario.competency}</span>
                </div>
            </div>
        `).join('');
    }
}

// Enhanced timer with better notifications
function enhancedStartTimer() {
    const savedDuration = localStorage.getItem('timerDuration') || 60;
    const duration = parseInt(savedDuration);
    
    if (currentTimer) {
        clearInterval(currentTimer);
    }
    
    timerSeconds = duration;
    updateEnhancedTimerDisplay();
    
    // Show timer section
    const timerSection = document.getElementById('timer-section');
    if (timerSection) {
        timerSection.style.display = 'block';
    }
    
    currentTimer = setInterval(() => {
        timerSeconds--;
        updateEnhancedTimerDisplay();
        
        if (timerSeconds <= 0) {
            enhancedShowTimerNotification();
            clearInterval(currentTimer);
            currentTimer = null;
        }
    }, 1000);
}

// Enhanced timer display
function updateEnhancedTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Add visual warning when time is running low
        if (timerSeconds <= 30) {
            timerDisplay.style.color = '#ff6b6b';
            timerDisplay.style.animation = 'pulse 1s infinite';
        } else {
            timerDisplay.style.color = '';
            timerDisplay.style.animation = '';
        }
    }
}

// Enhanced timer notification
function enhancedShowTimerNotification() {
    // Create enhanced notification
    const notificationHTML = `
        <div class="enhanced-timer-notification" id="enhanced-timer-notification">
            <div class="notification-content">
                <div class="notification-icon">⏰</div>
                <div class="notification-text">
                    <h3>Time's Up!</h3>
                    <p>Activity completed successfully</p>
                </div>
                <button class="notification-close" onclick="closeTimerNotification()">×</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Play enhanced sound
    playEnhancedNotificationSound();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeTimerNotification();
    }, 5000);
}

// Close timer notification
function closeTimerNotification() {
    const notification = document.getElementById('enhanced-timer-notification');
    if (notification) {
        notification.remove();
    }
}

// Enhanced notification sound
function playEnhancedNotificationSound() {
    // Try to play a gentle notification sound
    const audio = new Audio('dice-roll-1.mp3');
    audio.volume = 0.3; // Lower volume for gentler sound
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    // Also try to use browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WarrenGami SEL Toolkit', {
            body: 'Activity timer completed!',
            icon: '/warrengamilogo.png'
        });
    }
}

// Stop timer
function enhancedStopTimer() {
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = null;
    }
    
    // Hide timer section
    const timerSection = document.getElementById('timer-section');
    if (timerSection) {
        timerSection.style.display = 'none';
    }
}

// Enhanced card display
function updateEnhancedCardDisplay(scenario) {
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    
    if (cardFront && cardBack) {
        cardFront.innerHTML = `
            <div class="card-title">${escapeHtml(scenario.title)}</div>
            <div class="card-text">${escapeHtml(scenario.text)}</div>
        `;
        
        cardBack.innerHTML = `
            <div class="card-guiding-questions">
                <h4>Guiding Questions:</h4>
                <ul class="guiding-questions">
                    <li>How would you feel in this situation?</li>
                    <li>What would you do to help?</li>
                    <li>How could this be resolved peacefully?</li>
                </ul>
            </div>
            <div class="card-tags">
                <span class="card-competency">${scenario.competency}</span>
                ${scenario.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            </div>
        `;
    }
}

// HTML escaping function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize enhanced scenario functionality
function initEnhancedScenarioFeatures() {
    // Add enhanced CSS styles
    addEnhancedStyles();
    
    // Set up event listeners
    setupEnhancedEventListeners();
}

// Add enhanced CSS styles
function addEnhancedStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced Filter Status */
        .filter-status {
            background: var(--ice-blue);
            padding: 8px 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 0.9em;
            color: var(--midnight-blue);
        }
        
        /* Enhanced Card Counter */
        .counter-details {
            text-align: center;
        }
        
        .counter-main {
            font-size: 1.2em;
            font-weight: 600;
            color: var(--midnight-blue);
        }
        
        .counter-secondary {
            font-size: 0.8em;
            color: #666;
            margin-top: 2px;
        }
        
        /* Enhanced History */
        .history-item {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 6px;
            border-left: 3px solid var(--sky-blue);
        }
        
        .history-title {
            font-weight: 600;
            color: var(--midnight-blue);
        }
        
        .history-meta {
            font-size: 0.8em;
            color: #666;
            margin-top: 4px;
        }
        
        .history-time {
            margin-right: 10px;
        }
        
        .history-competency {
            background: var(--ice-blue);
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        /* No Cards Message */
        .no-cards-message {
            text-align: center;
            padding: 40px 20px;
            background: white;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .no-cards-icon {
            font-size: 3em;
            margin-bottom: 20px;
        }
        
        /* Enhanced Timer Notification */
        .enhanced-timer-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        }
        
        .notification-content {
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .notification-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        
        .notification-text h3 {
            margin: 0 0 10px 0;
            color: var(--midnight-blue);
        }
        
        .notification-text p {
            margin: 0;
            color: #666;
        }
        
        .notification-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #999;
        }
        
        .notification-close:hover {
            color: var(--midnight-blue);
        }
        
        /* Animations */
        @keyframes slideIn {
            from { transform: translate(-50%, -60%); opacity: 0; }
            to { transform: translate(-50%, -50%); opacity: 1; }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* Card Tags */
        .card-tags {
            margin-top: 15px;
        }
        
        .card-competency, .card-tag {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin: 2px;
        }
        
        .card-competency {
            background: var(--sky-blue);
            color: white;
        }
        
        .card-tag {
            background: var(--ice-blue);
            color: var(--midnight-blue);
        }
    `;
    
    document.head.appendChild(style);
}

// Set up enhanced event listeners
function setupEnhancedEventListeners() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Export functions for global use
window.enhancedFilterScenarios = enhancedFilterScenarios;
window.autoRefreshCard = autoRefreshCard;
window.drawNewCard = drawNewCard;
window.resetFilters = resetFilters;
window.enhancedStartTimer = enhancedStartTimer;
window.enhancedStopTimer = enhancedStopTimer;
window.closeTimerNotification = closeTimerNotification;
window.initEnhancedScenarioFeatures = initEnhancedScenarioFeatures; 