/**
 * Mood & Energy Tracker
 * Scalable real-time emotional awareness system
 */

class MoodEnergyTracker {
    constructor() {
        this.moodOptions = {
            happy: { emoji: '😊', color: '#28a745', description: 'Happy and content' },
            excited: { emoji: '🤩', color: '#ffc107', description: 'Excited and energetic' },
            calm: { emoji: '😌', color: '#17a2b8', description: 'Calm and peaceful' },
            neutral: { emoji: '😐', color: '#6c757d', description: 'Neutral and balanced' },
            sad: { emoji: '😔', color: '#6f42c1', description: 'Sad or down' },
            angry: { emoji: '😤', color: '#dc3545', description: 'Angry or frustrated' },
            anxious: { emoji: '😰', color: '#fd7e14', description: 'Anxious or worried' },
            tired: { emoji: '😴', color: '#6c757d', description: 'Tired or exhausted' }
        };

        this.energyLevels = {
            low: { emoji: '🔋', color: '#dc3545', description: 'Low energy' },
            medium: { emoji: '🔋', color: '#ffc107', description: 'Medium energy' },
            high: { emoji: '🔋', color: '#28a745', description: 'High energy' },
            supercharged: { emoji: '⚡', color: '#17a2b8', description: 'Supercharged!' }
        };

        this.currentMood = 'neutral';
        this.currentEnergy = 'medium';
        this.moodHistory = [];
        this.energyHistory = [];
        this.maxHistorySize = 100; // Scalable limit

        this.eventListeners = new Map();
        this.initialize();
    }

    /**
     * Initialize the tracker
     */
    initialize() {
        console.log('🌊 Mood & Energy Tracker Initialized');
        this.setupEventSystem();
        this.startPeriodicCheck();
    }

    /**
     * Update current mood
     * @param {string} mood - New mood
     * @param {Object} metadata - Additional metadata
     */
    updateMood(mood, metadata = {}) {
        if (!this.moodOptions[mood]) {
            throw new Error(`Invalid mood: ${mood}`);
        }

        const previousMood = this.currentMood;
        this.currentMood = mood;

        const moodEntry = {
            mood,
            timestamp: Date.now(),
            metadata: {
                source: metadata.source || 'user',
                context: metadata.context || 'general',
                ...metadata
            }
        };

        this.moodHistory.push(moodEntry);
        this.maintainHistorySize(this.moodHistory);

        // Emit mood change event
        this.emit('mood:change', {
            previous: previousMood,
            current: mood,
            entry: moodEntry
        });

        // Update global SEL system if available
        if (window.ExperientialSEL) {
            window.ExperientialSEL.updateMood(mood, metadata.source);
        }

        console.log(`😊 Mood updated: ${previousMood} → ${mood}`);
        return moodEntry;
    }

    /**
     * Update current energy level
     * @param {string} energy - New energy level
     * @param {Object} metadata - Additional metadata
     */
    updateEnergy(energy, metadata = {}) {
        if (!this.energyLevels[energy]) {
            throw new Error(`Invalid energy level: ${energy}`);
        }

        const previousEnergy = this.currentEnergy;
        this.currentEnergy = energy;

        const energyEntry = {
            energy,
            timestamp: Date.now(),
            metadata: {
                source: metadata.source || 'user',
                context: metadata.context || 'general',
                ...metadata
            }
        };

        this.energyHistory.push(energyEntry);
        this.maintainHistorySize(this.energyHistory);

        // Emit energy change event
        this.emit('energy:change', {
            previous: previousEnergy,
            current: energy,
            entry: energyEntry
        });

        // Update global SEL system if available
        if (window.ExperientialSEL) {
            window.ExperientialSEL.updateEnergy(energy);
        }

        console.log(`⚡ Energy updated: ${previousEnergy} → ${energy}`);
        return energyEntry;
    }

    /**
     * Get current state
     * @returns {Object} Current mood and energy state
     */
    getCurrentState() {
        return {
            mood: {
                current: this.currentMood,
                emoji: this.moodOptions[this.currentMood].emoji,
                color: this.moodOptions[this.currentMood].color,
                description: this.moodOptions[this.currentMood].description
            },
            energy: {
                current: this.currentEnergy,
                emoji: this.energyLevels[this.currentEnergy].emoji,
                color: this.energyLevels[this.currentEnergy].color,
                description: this.energyLevels[this.currentEnergy].description
            },
            timestamp: Date.now()
        };
    }

    /**
     * Get mood and energy statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const moodStats = this.getMoodStatistics();
        const energyStats = this.getEnergyStatistics();

        return {
            mood: moodStats,
            energy: energyStats,
            combined: this.getCombinedStatistics()
        };
    }

    /**
     * Get mood statistics
     * @returns {Object} Mood statistics
     */
    getMoodStatistics() {
        const moodCounts = {};
        const recentMoods = this.moodHistory.slice(-24); // Last 24 entries

        recentMoods.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        const totalEntries = recentMoods.length;
        const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b, 'neutral');

        return {
            totalEntries,
            mostCommonMood,
            moodBreakdown: moodCounts,
            averageMood: this.calculateAverageMood(recentMoods)
        };
    }

    /**
     * Get energy statistics
     * @returns {Object} Energy statistics
     */
    getEnergyStatistics() {
        const energyCounts = {};
        const recentEnergy = this.energyHistory.slice(-24); // Last 24 entries

        recentEnergy.forEach(entry => {
            energyCounts[entry.energy] = (energyCounts[entry.energy] || 0) + 1;
        });

        const totalEntries = recentEnergy.length;
        const mostCommonEnergy = Object.keys(energyCounts).reduce((a, b) => 
            energyCounts[a] > energyCounts[b] ? a : b, 'medium');

        return {
            totalEntries,
            mostCommonEnergy,
            energyBreakdown: energyCounts,
            averageEnergy: this.calculateAverageEnergy(recentEnergy)
        };
    }

    /**
     * Get combined statistics
     * @returns {Object} Combined statistics
     */
    getCombinedStatistics() {
        const moodStats = this.getMoodStatistics();
        const energyStats = this.getEnergyStatistics();

        return {
            overallWellbeing: this.calculateWellbeingScore(),
            moodEnergyCorrelation: this.calculateCorrelation(),
            trends: this.identifyTrends()
        };
    }

    /**
     * Calculate average mood
     * @param {Array} moods - Array of mood entries
     * @returns {number} Average mood score
     */
    calculateAverageMood(moods) {
        const moodScores = {
            happy: 5, excited: 4, calm: 3, neutral: 2, sad: 1, angry: 0, anxious: 1, tired: 1
        };

        if (moods.length === 0) return 2;

        const totalScore = moods.reduce((sum, entry) => sum + moodScores[entry.mood], 0);
        return totalScore / moods.length;
    }

    /**
     * Calculate average energy
     * @param {Array} energies - Array of energy entries
     * @returns {number} Average energy score
     */
    calculateAverageEnergy(energies) {
        const energyScores = {
            low: 1, medium: 2, high: 3, supercharged: 4
        };

        if (energies.length === 0) return 2;

        const totalScore = energies.reduce((sum, entry) => sum + energyScores[entry.energy], 0);
        return totalScore / energies.length;
    }

    /**
     * Calculate wellbeing score
     * @returns {number} Wellbeing score (0-10)
     */
    calculateWellbeingScore() {
        const moodStats = this.getMoodStatistics();
        const energyStats = this.getEnergyStatistics();

        const moodScore = moodStats.averageMood;
        const energyScore = energyStats.averageEnergy;

        // Combine mood and energy for overall wellbeing
        return Math.round((moodScore + energyScore) * 1.25); // Scale to 0-10
    }

    /**
     * Calculate correlation between mood and energy
     * @returns {number} Correlation coefficient
     */
    calculateCorrelation() {
        const recentMoods = this.moodHistory.slice(-12);
        const recentEnergy = this.energyHistory.slice(-12);

        if (recentMoods.length < 2 || recentEnergy.length < 2) return 0;

        // Simple correlation calculation
        const moodScores = recentMoods.map(entry => this.calculateAverageMood([entry]));
        const energyScores = recentEnergy.map(entry => this.calculateAverageEnergy([entry]));

        const n = Math.min(moodScores.length, energyScores.length);
        const sumX = moodScores.slice(0, n).reduce((a, b) => a + b, 0);
        const sumY = energyScores.slice(0, n).reduce((a, b) => a + b, 0);
        const sumXY = moodScores.slice(0, n).reduce((sum, x, i) => sum + x * energyScores[i], 0);
        const sumX2 = moodScores.slice(0, n).reduce((sum, x) => sum + x * x, 0);
        const sumY2 = energyScores.slice(0, n).reduce((sum, y) => sum + y * y, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Identify trends
     * @returns {Object} Trend analysis
     */
    identifyTrends() {
        const recentMoods = this.moodHistory.slice(-6);
        const recentEnergy = this.energyHistory.slice(-6);

        const moodTrend = this.calculateTrend(recentMoods.map(entry => entry.mood));
        const energyTrend = this.calculateTrend(recentEnergy.map(entry => entry.energy));

        return {
            mood: moodTrend,
            energy: energyTrend,
            overall: this.combineTrends(moodTrend, energyTrend)
        };
    }

    /**
     * Calculate trend direction
     * @param {Array} values - Array of values
     * @returns {string} Trend direction
     */
    calculateTrend(values) {
        if (values.length < 2) return 'stable';

        const moodScores = {
            happy: 5, excited: 4, calm: 3, neutral: 2, sad: 1, angry: 0, anxious: 1, tired: 1
        };

        const energyScores = {
            low: 1, medium: 2, high: 3, supercharged: 4
        };

        const scores = values.map(value => {
            if (moodScores[value] !== undefined) return moodScores[value];
            if (energyScores[value] !== undefined) return energyScores[value];
            return 2; // Default neutral
        });

        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;

        if (difference > 0.5) return 'improving';
        if (difference < -0.5) return 'declining';
        return 'stable';
    }

    /**
     * Combine mood and energy trends
     * @param {string} moodTrend - Mood trend
     * @param {string} energyTrend - Energy trend
     * @returns {string} Combined trend
     */
    combineTrends(moodTrend, energyTrend) {
        if (moodTrend === 'improving' && energyTrend === 'improving') return 'strongly_improving';
        if (moodTrend === 'declining' && energyTrend === 'declining') return 'strongly_declining';
        if (moodTrend === 'improving' || energyTrend === 'improving') return 'improving';
        if (moodTrend === 'declining' || energyTrend === 'declining') return 'declining';
        return 'stable';
    }

    /**
     * Maintain history size
     * @param {Array} history - History array
     */
    maintainHistorySize(history) {
        if (history.length > this.maxHistorySize) {
            history.splice(0, history.length - this.maxHistorySize);
        }
    }

    /**
     * Event system
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Emit events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in mood/energy event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Setup event system
     */
    setupEventSystem() {
        this.on('mood:change', (data) => {
            console.log(`😊 Mood changed: ${data.previous} → ${data.current}`);
        });

        this.on('energy:change', (data) => {
            console.log(`⚡ Energy changed: ${data.previous} → ${data.current}`);
        });
    }

    /**
     * Start periodic check
     */
    startPeriodicCheck() {
        setInterval(() => {
            const stats = this.getStatistics();
            this.emit('periodic:check', {
                timestamp: Date.now(),
                stats
            });
        }, 30000); // Every 30 seconds
    }

    /**
     * Create mood/energy UI component
     * @param {string} containerId - Container element ID
     * @param {Object} options - UI options
     */
    createTrackerUI(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container '${containerId}' not found`);
        }

        const ui = {
            container,
            elements: {}
        };

        // Create mood selector
        ui.elements.moodSection = document.createElement('div');
        ui.elements.moodSection.className = 'mood-section';
        ui.elements.moodSection.innerHTML = `
            <h3>😊 How are you feeling?</h3>
            <div class="mood-grid"></div>
        `;

        // Create energy selector
        ui.elements.energySection = document.createElement('div');
        ui.elements.energySection.className = 'energy-section';
        ui.elements.energySection.innerHTML = `
            <h3>⚡ What's your energy level?</h3>
            <div class="energy-grid"></div>
        `;

        // Create current state display
        ui.elements.currentState = document.createElement('div');
        ui.elements.currentState.className = 'current-state';
        ui.elements.currentState.innerHTML = `
            <h3>Current State</h3>
            <div class="state-display"></div>
        `;

        // Add sections to container
        container.appendChild(ui.elements.moodSection);
        container.appendChild(ui.elements.energySection);
        container.appendChild(ui.elements.currentState);

        // Populate mood grid
        const moodGrid = ui.elements.moodSection.querySelector('.mood-grid');
        Object.entries(this.moodOptions).forEach(([mood, config]) => {
            const moodBtn = document.createElement('button');
            moodBtn.className = 'mood-btn';
            moodBtn.innerHTML = `${config.emoji} ${mood.charAt(0).toUpperCase() + mood.slice(1)}`;
            moodBtn.style.cssText = `
                background: ${config.color};
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                margin: 0.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
            `;

            moodBtn.addEventListener('click', () => {
                this.updateMood(mood);
                ui.updateCurrentState();
            });

            moodGrid.appendChild(moodBtn);
        });

        // Populate energy grid
        const energyGrid = ui.elements.energySection.querySelector('.energy-grid');
        Object.entries(this.energyLevels).forEach(([energy, config]) => {
            const energyBtn = document.createElement('button');
            energyBtn.className = 'energy-btn';
            energyBtn.innerHTML = `${config.emoji} ${energy.charAt(0).toUpperCase() + energy.slice(1)}`;
            energyBtn.style.cssText = `
                background: ${config.color};
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                margin: 0.25rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9em;
            `;

            energyBtn.addEventListener('click', () => {
                this.updateEnergy(energy);
                ui.updateCurrentState();
            });

            energyGrid.appendChild(energyBtn);
        });

        // Update current state method
        ui.updateCurrentState = () => {
            const state = this.getCurrentState();
            const stateDisplay = ui.elements.currentState.querySelector('.state-display');
            stateDisplay.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0;">
                    <div style="font-size: 2em;">${state.mood.emoji}</div>
                    <div>
                        <strong>Mood:</strong> ${state.mood.description}<br>
                        <strong>Energy:</strong> ${state.energy.description}
                    </div>
                    <div style="font-size: 2em;">${state.energy.emoji}</div>
                </div>
            `;
        };

        // Initialize current state
        ui.updateCurrentState();

        return ui;
    }
}

// Global instance
window.MoodEnergyTracker = new MoodEnergyTracker();

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoodEnergyTracker;
} 