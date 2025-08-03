// Dashboard-Aligned Dice Interface
// Handles the redesigned dice section with WarrenGami SEL Dashboard aesthetics

class DashboardDiceInterface {
    constructor() {
        this.currentCategory = '';
        this.currentPrompt = '';
        this.dicePrompts = [];
        this.isRolling = false;
    }

    // Initialize the dice interface with dashboard styling
    initDiceInterface(prompts, category = 'Emotions & Feelings') {
        this.dicePrompts = prompts;
        this.currentCategory = category;
        
        // Create the enhanced dice interface
        const diceInterface = this.createDiceInterface();
        
        // Replace the main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = diceInterface;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show initial prompt
        this.showRandomPrompt();
    }

    // Create the dashboard-aligned dice interface HTML
    createDiceInterface() {
        return `
            <div class="dice-prompt-container">
                <div class="category-tag">${this.currentCategory}</div>
                <div class="dice-prompt-text" id="dice-prompt-text">
                    Click "Roll Dice" to get started
                </div>
            </div>
            
            <div class="dice-scene">
                <div class="dice" id="dashboard-dice">
                    ${this.dicePrompts.slice(0, 6).map((prompt, i) => 
                        `<div class="face face-${i + 1}">${this.escapeHtml(prompt)}</div>`
                    ).join('')}
                </div>
            </div>
            
            <div id="prompt-result"></div>
        `;
    }

    // Setup event listeners for the dice interface
    setupEventListeners() {
        // Add keyboard support for rolling
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.rollDice();
            }
        });

        // Make functions globally available
        window.rollDice = () => this.rollDice();
        window.startTimer = () => this.startTimer();
        window.stopTimer = () => this.stopTimer();
    }

    // Enhanced dice roll with dashboard animations
    async rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const dice = document.getElementById('dashboard-dice');
        const promptText = document.getElementById('dice-prompt-text');
        const resultDiv = document.getElementById('prompt-result');
        
        if (!dice || !this.dicePrompts.length) return;
        
        // Add rolling animation
        dice.classList.add('rolling');
        
        // Play sound if available
        this.playDiceSound();
        
        // Randomly select a prompt
        const randomIndex = Math.floor(Math.random() * this.dicePrompts.length);
        const selectedPrompt = this.dicePrompts[randomIndex];
        this.currentPrompt = selectedPrompt;
        
        // Calculate which face to show (1-6)
        const faceNumber = (randomIndex % 6) + 1;
        
        // Show rolling state in prompt box
        promptText.textContent = 'Rolling...';
        
        // Stop rolling after animation
        setTimeout(() => {
            dice.classList.remove('rolling');
            dice.className = `dice show-${faceNumber}`;
            
            // Show result in prompt box
            promptText.textContent = selectedPrompt;
            
            // Show result in result div
            resultDiv.textContent = selectedPrompt;
            
            // Add bounce effect
            setTimeout(() => {
                dice.classList.add('bounce');
                setTimeout(() => {
                    dice.classList.remove('bounce');
                    dice.classList.add('settled');
                    setTimeout(() => dice.classList.remove('settled'), 500);
                }, 300);
            }, 100);
            
            this.isRolling = false;
        }, 2000);
    }

    // Start timer with dashboard styling
    startTimer() {
        const savedDuration = localStorage.getItem('timerDuration') || 60;
        const duration = parseInt(savedDuration);
        
        if (window.currentTimer) {
            clearInterval(window.currentTimer);
        }
        
        let timeLeft = duration;
        const timerDisplay = document.getElementById('timer-display');
        const timerSection = document.getElementById('timer-section');
        
        if (timerSection) {
            timerSection.style.display = 'block';
        }
        
        this.updateTimerDisplay(timeLeft);
        
        window.currentTimer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(window.currentTimer);
                window.currentTimer = null;
                this.showTimerNotification();
                if (timerSection) {
                    timerSection.style.display = 'none';
                }
            }
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (window.currentTimer) {
            clearInterval(window.currentTimer);
            window.currentTimer = null;
        }
        
        const timerSection = document.getElementById('timer-section');
        if (timerSection) {
            timerSection.style.display = 'none';
        }
    }

    // Update timer display with dashboard styling
    updateTimerDisplay(seconds) {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    // Show timer notification with dashboard styling
    showTimerNotification() {
        const notification = document.getElementById('timer-notification');
        if (notification) {
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    // Play dice sound (if available)
    playDiceSound() {
        try {
            const audio = new Audio('dice-roll-1.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio not available');
        }
    }

    // Show a random prompt without rolling
    showRandomPrompt() {
        if (this.dicePrompts.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.dicePrompts.length);
            const selectedPrompt = this.dicePrompts[randomIndex];
            this.currentPrompt = selectedPrompt;
            
            const promptText = document.getElementById('dice-prompt-text');
            if (promptText) {
                promptText.textContent = selectedPrompt;
            }
        }
    }

    // Update category
    updateCategory(category) {
        this.currentCategory = category;
        const categoryTag = document.querySelector('.category-tag');
        if (categoryTag) {
            categoryTag.textContent = category;
        }
    }

    // Update prompts
    updatePrompts(prompts) {
        this.dicePrompts = prompts;
        // Rebuild dice faces if needed
        const dice = document.getElementById('dashboard-dice');
        if (dice) {
            const faces = dice.querySelectorAll('.face');
            prompts.slice(0, 6).forEach((prompt, i) => {
                if (faces[i]) {
                    faces[i].textContent = this.escapeHtml(prompt);
                }
            });
        }
    }

    // HTML escaping for security
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the dashboard dice interface
const dashboardDice = new DashboardDiceInterface();

// Export for use in other files
window.DashboardDiceInterface = DashboardDiceInterface;
window.dashboardDice = dashboardDice; 