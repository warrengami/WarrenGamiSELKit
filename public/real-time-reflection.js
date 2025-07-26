/**
 * Real-Time Reflection System
 * Scalable, immediate reflection experiences without data collection
 */

class RealTimeReflection {
    constructor() {
        this.reflectionTypes = {
            immediate: {
                prompts: [
                    "How are you feeling right now?",
                    "What made you smile today?",
                    "What's one thing you're grateful for?",
                    "What's a challenge you're working through?",
                    "What's something you're proud of?",
                    "What would you like to improve?",
                    "What's something kind you did today?",
                    "What's something kind someone did for you?"
                ],
                duration: 60, // 1 minute
                format: 'individual'
            },
            group: {
                prompts: [
                    "What did you learn from someone else today?",
                    "How did you help someone today?",
                    "What's something kind you witnessed?",
                    "What's a challenge the group worked through?",
                    "What's something the group accomplished together?",
                    "How did the group support each other?"
                ],
                duration: 120, // 2 minutes
                format: 'collective'
            },
            guided: {
                prompts: [
                    "Take a deep breath. How does your body feel?",
                    "Think of a recent success. What made it possible?",
                    "Imagine a challenge. What strengths can you use?",
                    "Picture someone you care about. What would you tell them?",
                    "Consider your goals. What's one small step forward?",
                    "Reflect on your day. What's one thing you learned?"
                ],
                duration: 180, // 3 minutes
                format: 'meditative'
            }
        };

        this.activeReflections = new Map();
        this.reflectionHistory = [];
        this.maxHistorySize = 50; // Scalable limit
    }

    /**
     * Start a reflection session
     * @param {string} type - Reflection type (immediate, group, guided)
     * @param {Object} options - Session options
     */
    startReflection(type, options = {}) {
        const reflectionConfig = this.reflectionTypes[type];
        if (!reflectionConfig) {
            throw new Error(`Reflection type '${type}' not found`);
        }

        const sessionId = `reflection-${Date.now()}`;
        const prompt = this.getRandomPrompt(type);
        
        const session = {
            id: sessionId,
            type,
            prompt,
            startTime: Date.now(),
            duration: reflectionConfig.duration,
            format: reflectionConfig.format,
            participants: new Set(),
            responses: [],
            state: 'active'
        };

        this.activeReflections.set(sessionId, session);

        // Emit reflection start event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('reflection:start', {
                sessionId,
                type,
                prompt,
                duration: session.duration
            });
        }

        console.log(`🧘 Started ${type} reflection: "${prompt}"`);
        return sessionId;
    }

    /**
     * Get random prompt for reflection type
     * @param {string} type - Reflection type
     * @returns {string} Random prompt
     */
    getRandomPrompt(type) {
        const prompts = this.reflectionTypes[type].prompts;
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    /**
     * Add response to active reflection
     * @param {string} sessionId - Session ID
     * @param {string} response - User response
     * @param {Object} metadata - Response metadata
     */
    addResponse(sessionId, response, metadata = {}) {
        const session = this.activeReflections.get(sessionId);
        if (!session) {
            throw new Error(`Reflection session '${sessionId}' not found`);
        }

        const responseObj = {
            id: `response-${Date.now()}`,
            text: response,
            timestamp: Date.now(),
            metadata: {
                mood: metadata.mood || 'neutral',
                energy: metadata.energy || 'medium',
                ...metadata
            }
        };

        session.responses.push(responseObj);

        // Emit response event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('reflection:response', {
                sessionId,
                response: responseObj
            });
        }

        console.log(`💭 Response added to ${sessionId}: "${response.substring(0, 50)}..."`);
        return responseObj.id;
    }

    /**
     * End reflection session
     * @param {string} sessionId - Session ID
     */
    endReflection(sessionId) {
        const session = this.activeReflections.get(sessionId);
        if (!session) {
            throw new Error(`Reflection session '${sessionId}' not found`);
        }

        session.state = 'completed';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // Move to history
        this.reflectionHistory.push(session);
        this.activeReflections.delete(sessionId);

        // Maintain history size
        if (this.reflectionHistory.length > this.maxHistorySize) {
            this.reflectionHistory.shift();
        }

        // Emit reflection end event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('reflection:end', {
                sessionId,
                duration: session.duration,
                responseCount: session.responses.length,
                type: session.type
            });
        }

        console.log(`✅ Ended reflection ${sessionId} with ${session.responses.length} responses`);
    }

    /**
     * Get active reflections
     * @returns {Array} Active reflection sessions
     */
    getActiveReflections() {
        return Array.from(this.activeReflections.values());
    }

    /**
     * Get reflection statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const active = this.getActiveReflections();
        const completed = this.reflectionHistory;

        return {
            active: active.length,
            completed: completed.length,
            totalResponses: completed.reduce((sum, session) => sum + session.responses.length, 0),
            averageDuration: completed.length > 0 
                ? completed.reduce((sum, session) => sum + session.duration, 0) / completed.length
                : 0,
            typeBreakdown: this.getTypeBreakdown()
        };
    }

    /**
     * Get breakdown by reflection type
     * @returns {Object} Type breakdown
     */
    getTypeBreakdown() {
        const allSessions = [...this.getActiveReflections(), ...this.reflectionHistory];
        const breakdown = {};

        allSessions.forEach(session => {
            breakdown[session.type] = (breakdown[session.type] || 0) + 1;
        });

        return breakdown;
    }

    /**
     * Create reflection UI component
     * @param {string} containerId - Container element ID
     * @param {Object} options - UI options
     */
    createReflectionUI(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container '${containerId}' not found`);
        }

        const ui = {
            container,
            sessionId: null,
            timer: null,
            elements: {}
        };

        // Create UI elements
        ui.elements.prompt = document.createElement('div');
        ui.elements.prompt.className = 'reflection-prompt';
        ui.elements.prompt.style.cssText = `
            font-size: 1.5em;
            text-align: center;
            margin: 2rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 15px;
            border: 2px solid #90caf9;
        `;

        ui.elements.timer = document.createElement('div');
        ui.elements.timer.className = 'reflection-timer';
        ui.elements.timer.style.cssText = `
            text-align: center;
            font-size: 2em;
            font-weight: bold;
            color: #0f2c4d;
            margin: 1rem 0;
        `;

        ui.elements.responseArea = document.createElement('textarea');
        ui.elements.responseArea.className = 'reflection-response';
        ui.elements.responseArea.placeholder = 'Share your thoughts...';
        ui.elements.responseArea.style.cssText = `
            width: 100%;
            min-height: 150px;
            padding: 1rem;
            border: 2px solid #e0e6ed;
            border-radius: 10px;
            font-family: inherit;
            font-size: 1.1em;
            resize: vertical;
            margin: 1rem 0;
        `;

        ui.elements.submitBtn = document.createElement('button');
        ui.elements.submitBtn.className = 'reflection-submit';
        ui.elements.submitBtn.textContent = 'Share Reflection';
        ui.elements.submitBtn.style.cssText = `
            background: linear-gradient(135deg, #73bdf5, #42a5f5);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        // Add elements to container
        container.appendChild(ui.elements.prompt);
        container.appendChild(ui.elements.timer);
        container.appendChild(ui.elements.responseArea);
        container.appendChild(ui.elements.submitBtn);

        // Event handlers
        ui.elements.submitBtn.addEventListener('click', () => {
            const response = ui.elements.responseArea.value.trim();
            if (response && ui.sessionId) {
                this.addResponse(ui.sessionId, response);
                ui.elements.responseArea.value = '';
                ui.elements.submitBtn.textContent = 'Reflection Shared!';
                setTimeout(() => {
                    ui.elements.submitBtn.textContent = 'Share Reflection';
                }, 2000);
            }
        });

        // Start reflection method
        ui.startReflection = (type) => {
            const sessionId = this.startReflection(type);
            ui.sessionId = sessionId;
            ui.elements.prompt.textContent = this.getRandomPrompt(type);
            
            // Start timer
            const duration = this.reflectionTypes[type].duration;
            let timeLeft = duration;
            
            ui.timer = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                ui.elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 0) {
                    clearInterval(ui.timer);
                    this.endReflection(sessionId);
                    ui.elements.timer.textContent = 'Time\'s up!';
                    ui.sessionId = null;
                }
            }, 1000);
        };

        return ui;
    }
}

// Global instance
window.RealTimeReflection = new RealTimeReflection();

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeReflection;
} 