/**
 * Experiential SEL Core System
 * Scalable architecture for immediate, engaging SEL experiences
 * No data collection - focus on real-time interaction and learning
 */

class ExperientialSELCore {
    constructor() {
        this.version = '2.0.0';
        this.features = {
            realTime: true,
            noDataCollection: true,
            scalable: true,
            modular: true
        };
        
        // Scalable experience registry
        this.experienceRegistry = new Map();
        this.activeExperiences = new Set();
        this.eventListeners = new Map();
        
        // Real-time state management
        this.currentState = {
            mood: 'neutral',
            energy: 'medium',
            focus: 'engaged',
            timestamp: Date.now()
        };
        
        this.initialize();
    }

    /**
     * Initialize the core system
     */
    initialize() {
        console.log('🌊 Experiential SEL Core Initialized');
        this.registerDefaultExperiences();
        this.setupEventSystem();
        this.startHeartbeat();
    }

    /**
     * Register a new experience type
     * @param {string} type - Experience type (dice, scenario, reflection, etc.)
     * @param {Object} config - Experience configuration
     */
    registerExperience(type, config) {
        const experience = {
            id: `${type}-${Date.now()}`,
            type,
            config,
            state: 'inactive',
            participants: new Set(),
            startTime: null,
            endTime: null
        };

        this.experienceRegistry.set(type, experience);
        console.log(`✅ Registered experience: ${type}`);
        return experience.id;
    }

    /**
     * Start an experience
     * @param {string} type - Experience type
     * @param {Object} options - Experience options
     */
    startExperience(type, options = {}) {
        const experience = this.experienceRegistry.get(type);
        if (!experience) {
            console.warn(`Experience type '${type}' not found - creating default`);
            this.registerExperience(type, { name: type, description: 'Default experience' });
            return this.startExperience(type, options);
        }

        experience.state = 'active';
        experience.startTime = Date.now();
        experience.participants.clear();
        
        this.activeExperiences.add(experience.id);
        
        // Emit experience start event
        this.emit('experience:start', {
            experienceId: experience.id,
            type,
            options,
            timestamp: experience.startTime
        });

        console.log(`🚀 Started experience: ${type}`);
        return experience.id;
    }

    /**
     * End an experience
     * @param {string} experienceId - Experience ID
     */
    endExperience(experienceId) {
        const experience = Array.from(this.experienceRegistry.values())
            .find(exp => exp.id === experienceId);
        
        if (!experience) {
            console.warn(`Experience '${experienceId}' not found`);
            return;
        }

        experience.state = 'completed';
        experience.endTime = Date.now();
        this.activeExperiences.delete(experienceId);

        // Emit experience end event
        this.emit('experience:end', {
            experienceId,
            duration: experience.endTime - experience.startTime,
            participants: Array.from(experience.participants),
            timestamp: experience.endTime
        });

        console.log(`✅ Ended experience: ${experienceId}`);
    }

    /**
     * Real-time mood tracking
     * @param {string} mood - Current mood
     * @param {string} source - Source of mood update
     */
    updateMood(mood, source = 'user') {
        const previousMood = this.currentState.mood;
        this.currentState.mood = mood;
        this.currentState.timestamp = Date.now();

        // Emit mood change event
        this.emit('mood:change', {
            previous: previousMood,
            current: mood,
            source,
            timestamp: this.currentState.timestamp
        });

        console.log(`😊 Mood updated: ${previousMood} → ${mood} (${source})`);
    }

    /**
     * Real-time energy tracking
     * @param {string} energy - Current energy level
     */
    updateEnergy(energy) {
        const previousEnergy = this.currentState.energy;
        this.currentState.energy = energy;
        this.currentState.timestamp = Date.now();

        // Emit energy change event
        this.emit('energy:change', {
            previous: previousEnergy,
            current: energy,
            timestamp: this.currentState.timestamp
        });

        console.log(`⚡ Energy updated: ${previousEnergy} → ${energy}`);
    }

    /**
     * Event system for scalability
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
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return {
            ...this.currentState,
            activeExperiences: Array.from(this.activeExperiences),
            totalExperiences: this.experienceRegistry.size
        };
    }

    /**
     * Register default experiences
     */
    registerDefaultExperiences() {
        // Dice experiences
        this.registerExperience('dice', {
            types: ['emotions', 'empathy', 'friendship', 'coping', 'problem-solving', 'self-awareness'],
            duration: 300, // 5 minutes
            participants: 'unlimited',
            realTime: true
        });

        // Scenario experiences
        this.registerExperience('scenario', {
            types: ['social', 'conflict', 'empathy', 'decision-making'],
            duration: 600, // 10 minutes
            participants: 'unlimited',
            realTime: true
        });

        // Reflection experiences
        this.registerExperience('reflection', {
            types: ['individual', 'group', 'guided'],
            duration: 180, // 3 minutes
            participants: 'unlimited',
            realTime: true
        });

        // Mindfulness experiences
        this.registerExperience('mindfulness', {
            types: ['breathing', 'focus', 'calming', 'awareness'],
            duration: 120, // 2 minutes
            participants: 'unlimited',
            realTime: true
        });
    }

    /**
     * Setup event system
     */
    setupEventSystem() {
        // Global event listeners
        this.on('experience:start', (data) => {
            console.log(`🎯 Experience started: ${data.type}`);
        });

        this.on('experience:end', (data) => {
            console.log(`✅ Experience completed: ${data.experienceId} (${data.duration}ms)`);
        });

        this.on('mood:change', (data) => {
            console.log(`😊 Mood changed: ${data.previous} → ${data.current}`);
        });

        this.on('energy:change', (data) => {
            console.log(`⚡ Energy changed: ${data.previous} → ${data.current}`);
        });
    }

    /**
     * Heartbeat for real-time updates
     */
    startHeartbeat() {
        setInterval(() => {
            this.emit('heartbeat', {
                timestamp: Date.now(),
                state: this.getState()
            });
        }, 5000); // Every 5 seconds
    }

    /**
     * Get experience statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const experiences = Array.from(this.experienceRegistry.values());
        const active = experiences.filter(exp => exp.state === 'active');
        const completed = experiences.filter(exp => exp.state === 'completed');

        return {
            total: experiences.length,
            active: active.length,
            completed: completed.length,
            types: [...new Set(experiences.map(exp => exp.type))],
            averageDuration: completed.length > 0 
                ? completed.reduce((sum, exp) => sum + (exp.endTime - exp.startTime), 0) / completed.length
                : 0
        };
    }

    /**
     * Cleanup completed experiences
     */
    cleanup() {
        const experiences = Array.from(this.experienceRegistry.values());
        const oldExperiences = experiences.filter(exp => 
            exp.state === 'completed' && 
            Date.now() - exp.endTime > 3600000 // 1 hour
        );

        oldExperiences.forEach(exp => {
            this.experienceRegistry.delete(exp.type);
        });

        if (oldExperiences.length > 0) {
            console.log(`🧹 Cleaned up ${oldExperiences.length} old experiences`);
        }
    }
}

// Global instance
window.ExperientialSEL = new ExperientialSELCore();

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperientialSELCore;
} 