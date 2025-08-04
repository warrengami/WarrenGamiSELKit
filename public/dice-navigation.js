// Dashboard-Aligned Dice Interface
// Handles the redesigned dice section with WarrenGami SEL Dashboard aesthetics

class DashboardDiceInterface {
    constructor() {
        this.currentCategory = '';
        this.currentPrompt = '';
        this.dicePrompts = [];
        this.isRolling = false;
        this.rollCount = 0;
        this.totalPrompts = 0;
    }

    // Initialize the dice interface with dashboard styling
    initDiceInterface(prompts, category = 'Emotions & Feelings') {
        this.dicePrompts = prompts;
        this.totalPrompts = prompts.length;
        this.currentCategory = category;
        this.rollCount = 0;
        
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
            <div class="dice-content-panel">
                <div class="help-tooltip" title="Click for help" onclick="showHelp()">?</div>
                
                <div class="progress-tracker" id="progress-tracker">
                    Roll ${this.rollCount} of ${this.totalPrompts} prompts
                </div>
                
                <div class="dice-prompt-container">
                    <div class="category-tag">${this.currentCategory}</div>
                    <div class="dice-prompt-text" id="dice-prompt-text">
                        Click "Roll Dice" to get started
                    </div>
                </div>
                
                <div class="dice-scene">
                    <div class="dice" id="dashboard-dice">
                        ${this.dicePrompts.slice(0, 6).map((prompt, i) => 
                            `<div class="face face-${i + 1}">
                                <div class="prompt-display">${this.escapeHtml(prompt)}</div>
                            </div>`
                        ).join('')}
                    </div>
                    
                    <!-- Lottie Animation Container -->
                    <div class="lottie-container" id="lottie-container">
                        <div id="lottie-animation"></div>
                    </div>
                </div>
                
                <div id="prompt-result"></div>
            </div>
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
        window.showHelp = () => this.showHelp();
    }

    // Enhanced dice roll with CSS animation (Lottie fallback)
    async rollDice() {
        console.log('Roll dice called');
        if (this.isRolling) {
            console.log('Already rolling, returning');
            return;
        }
        
        this.isRolling = true;
        const dice = document.getElementById('dashboard-dice');
        const promptText = document.getElementById('dice-prompt-text');
        const resultDiv = document.getElementById('prompt-result');
        const lottieContainer = document.getElementById('lottie-container');
        const lottieAnimation = document.getElementById('lottie-animation');
        
        console.log('Dice element:', dice);
        console.log('Dice prompts:', this.dicePrompts);
        
        if (!dice || !this.dicePrompts.length) {
            console.log('Missing dice element or prompts');
            return;
        }
        
        // Clear any existing classes
        dice.className = 'dice';
        
        // Show rolling state in prompt box
        promptText.textContent = 'Rolling...';
        
        // Update progress
        this.rollCount++;
        this.updateProgressTracker();
        
        // Play sound if available
        this.playDiceSound();
        
        // Use CSS animation for now (Lottie can be added later)
        dice.classList.add('rolling');
        
        // Stop rolling after animation
        setTimeout(() => {
            this.showDiceResult(dice, promptText, resultDiv, lottieContainer);
        }, 2500);
    }
    
    // Show dice result after animation
    showDiceResult(dice, promptText, resultDiv, lottieContainer) {
        // Randomly select a prompt
        const randomIndex = Math.floor(Math.random() * this.dicePrompts.length);
        const selectedPrompt = this.dicePrompts[randomIndex];
        this.currentPrompt = selectedPrompt;
        
        // Calculate which face to show (1-6)
        const faceNumber = (randomIndex % 6) + 1;
        
        // Hide Lottie animation
        if (lottieContainer) {
            lottieContainer.classList.remove('visible');
        }
        
        // Remove rolling class and show result
        dice.classList.remove('rolling');
        dice.className = `dice show-${faceNumber}`;
        
        // Show result in prompt box with fade-in effect
        this.fadeInText(promptText, selectedPrompt);
        
        // Show result in result div
        this.fadeInText(resultDiv, selectedPrompt);
        
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
    }

    // Fade in text with smooth transition
    fadeInText(element, text) {
        element.style.opacity = '0';
        element.textContent = text;
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease';
            element.style.opacity = '1';
        }, 100);
    }

    // Update progress tracker
    updateProgressTracker() {
        const progressTracker = document.getElementById('progress-tracker');
        if (progressTracker) {
            progressTracker.textContent = `Roll ${this.rollCount} of ${this.totalPrompts} prompts`;
        }
    }

    // Show help tooltip
    showHelp() {
        const helpText = `
            <div style="background: var(--paper-white); padding: 1.5rem; border-radius: 12px; box-shadow: var(--card-shadow); max-width: 400px; margin: 1rem;">
                <h3 style="color: var(--warren-blue); margin-bottom: 1rem;">How to Use the Dice</h3>
                <ul style="text-align: left; line-height: 1.6;">
                    <li><strong>Roll Dice:</strong> Click or press Spacebar to roll</li>
                    <li><strong>Start Timer:</strong> Begin a 60-second discussion timer</li>
                    <li><strong>Stop Timer:</strong> End the current timer</li>
                    <li><strong>Switch Categories:</strong> Choose different prompt types</li>
                </ul>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-muted);">
                    Each roll selects a random prompt from the current category.
                </p>
            </div>
        `;
        
        // Create a modal or tooltip
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        modal.innerHTML = helpText;
        modal.onclick = () => document.body.removeChild(modal);
        
        document.body.appendChild(modal);
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
        this.totalPrompts = prompts.length;
        this.rollCount = 0;
        this.updateProgressTracker();
        
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

    // Reset progress
    resetProgress() {
        this.rollCount = 0;
        this.updateProgressTracker();
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

// Debug log to confirm script is loaded
console.log('Dashboard Dice Interface loaded:', dashboardDice); 