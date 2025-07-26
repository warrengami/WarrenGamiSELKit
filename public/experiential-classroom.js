/**
 * Experiential Classroom Mode
 * Enhanced classroom experience with real-time features and no data collection
 */

class ExperientialClassroom {
    constructor() {
        this.currentSession = null;
        this.participants = new Set();
        this.activeExperiences = new Map();
        this.realTimeFeatures = {
            moodTracking: true,
            energyMonitoring: true,
            reflectionSessions: true,
            discussionTools: true
        };
        
        this.initialize();
    }

    /**
     * Initialize experiential classroom
     */
    initialize() {
        console.log('🌊 Experiential Classroom Mode Initialized');
        this.setupRealTimeFeatures();
        this.setupEventListeners();
    }

    /**
     * Start a classroom session
     * @param {Object} options - Session options
     */
    startSession(options = {}) {
        const sessionId = `classroom-${Date.now()}`;
        
        this.currentSession = {
            id: sessionId,
            startTime: Date.now(),
            type: options.type || 'general',
            participants: new Set(),
            experiences: [],
            moodHistory: [],
            energyHistory: [],
            state: 'active'
        };

        // Initialize real-time features
        this.initializeRealTimeFeatures();
        
        // Emit session start event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:session:start', {
                sessionId,
                options
            });
        }

        console.log(`🚀 Classroom session started: ${sessionId}`);
        return sessionId;
    }

    /**
     * End current classroom session
     */
    endSession() {
        if (!this.currentSession) {
            throw new Error('No active classroom session');
        }

        this.currentSession.state = 'completed';
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

        // Emit session end event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:session:end', {
                sessionId: this.currentSession.id,
                duration: this.currentSession.duration,
                participants: Array.from(this.currentSession.participants),
                experiences: this.currentSession.experiences
            });
        }

        console.log(`✅ Classroom session ended: ${this.currentSession.id}`);
        this.currentSession = null;
    }

    /**
     * Start an experience in the classroom
     * @param {string} type - Experience type
     * @param {Object} options - Experience options
     */
    startExperience(type, options = {}) {
        if (!this.currentSession) {
            throw new Error('No active classroom session');
        }

        const experienceId = `experience-${Date.now()}`;
        const experience = {
            id: experienceId,
            type,
            startTime: Date.now(),
            options,
            participants: new Set(),
            responses: [],
            state: 'active'
        };

        this.activeExperiences.set(experienceId, experience);
        this.currentSession.experiences.push(experience);

        // Emit experience start event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:experience:start', {
                sessionId: this.currentSession.id,
                experienceId,
                type,
                options
            });
        }

        console.log(`🎯 Started classroom experience: ${type}`);
        return experienceId;
    }

    /**
     * End an experience
     * @param {string} experienceId - Experience ID
     */
    endExperience(experienceId) {
        const experience = this.activeExperiences.get(experienceId);
        if (!experience) {
            throw new Error(`Experience '${experienceId}' not found`);
        }

        experience.state = 'completed';
        experience.endTime = Date.now();
        experience.duration = experience.endTime - experience.startTime;

        this.activeExperiences.delete(experienceId);

        // Emit experience end event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:experience:end', {
                sessionId: this.currentSession.id,
                experienceId,
                duration: experience.duration,
                participants: Array.from(experience.participants),
                responses: experience.responses.length
            });
        }

        console.log(`✅ Ended classroom experience: ${experienceId}`);
    }

    /**
     * Add participant to session
     * @param {string} participantId - Participant ID
     * @param {Object} metadata - Participant metadata
     */
    addParticipant(participantId, metadata = {}) {
        if (!this.currentSession) {
            throw new Error('No active classroom session');
        }

        const participant = {
            id: participantId,
            joinTime: Date.now(),
            metadata: {
                name: metadata.name || 'Anonymous',
                role: metadata.role || 'student',
                ...metadata
            }
        };

        this.currentSession.participants.add(participant);
        this.participants.add(participantId);

        // Emit participant join event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:participant:join', {
                sessionId: this.currentSession.id,
                participant
            });
        }

        console.log(`👤 Participant joined: ${participantId}`);
    }

    /**
     * Remove participant from session
     * @param {string} participantId - Participant ID
     */
    removeParticipant(participantId) {
        if (!this.currentSession) {
            throw new Error('No active classroom session');
        }

        this.currentSession.participants.delete(participantId);
        this.participants.delete(participantId);

        // Emit participant leave event
        if (window.ExperientialSEL) {
            window.ExperientialSEL.emit('classroom:participant:leave', {
                sessionId: this.currentSession.id,
                participantId
            });
        }

        console.log(`👋 Participant left: ${participantId}`);
    }

    /**
     * Setup real-time features
     */
    setupRealTimeFeatures() {
        // Mood tracking
        if (this.realTimeFeatures.moodTracking && window.MoodEnergyTracker) {
            this.setupMoodTracking();
        }

        // Energy monitoring
        if (this.realTimeFeatures.energyMonitoring && window.MoodEnergyTracker) {
            this.setupEnergyMonitoring();
        }

        // Reflection sessions
        if (this.realTimeFeatures.reflectionSessions && window.RealTimeReflection) {
            this.setupReflectionSessions();
        }

        // Discussion tools
        if (this.realTimeFeatures.discussionTools) {
            this.setupDiscussionTools();
        }
    }

    /**
     * Setup mood tracking
     */
    setupMoodTracking() {
        const moodContainer = document.getElementById('classroom-mood-tracker');
        if (moodContainer) {
            const moodUI = window.MoodEnergyTracker.createTrackerUI('classroom-mood-tracker');
            
            // Listen for mood changes
            window.MoodEnergyTracker.on('mood:change', (data) => {
                if (this.currentSession) {
                    this.currentSession.moodHistory.push({
                        mood: data.current,
                        timestamp: Date.now(),
                        source: 'classroom'
                    });
                }
            });
        }
    }

    /**
     * Setup energy monitoring
     */
    setupEnergyMonitoring() {
        const energyContainer = document.getElementById('classroom-energy-tracker');
        if (energyContainer) {
            const energyUI = window.MoodEnergyTracker.createTrackerUI('classroom-energy-tracker');
            
            // Listen for energy changes
            window.MoodEnergyTracker.on('energy:change', (data) => {
                if (this.currentSession) {
                    this.currentSession.energyHistory.push({
                        energy: data.current,
                        timestamp: Date.now(),
                        source: 'classroom'
                    });
                }
            });
        }
    }

    /**
     * Setup reflection sessions
     */
    setupReflectionSessions() {
        const reflectionContainer = document.getElementById('classroom-reflection');
        if (reflectionContainer) {
            const reflectionUI = window.RealTimeReflection.createReflectionUI('classroom-reflection');
            
            // Listen for reflection events
            window.RealTimeReflection.on('reflection:start', (data) => {
                if (this.currentSession) {
                    this.startExperience('reflection', {
                        type: data.type,
                        prompt: data.prompt
                    });
                }
            });
        }
    }

    /**
     * Setup discussion tools
     */
    setupDiscussionTools() {
        this.discussionTools = {
            thinkPairShare: {
                steps: ['Think', 'Pair', 'Share'],
                timers: [30, 60, 90], // seconds
                currentStep: 0,
                timer: null
            },
            circleTime: {
                format: 'Pass the talking piece',
                guidelines: ['Listen with respect', 'Speak from the heart', 'Be brief'],
                active: false
            },
            quickCheck: {
                options: ['Ready to learn!', 'Need a break', 'Could use support', 'Feeling strong'],
                responses: new Map()
            }
        };
    }

    /**
     * Start Think-Pair-Share discussion
     * @param {Object} options - Discussion options
     */
    startThinkPairShare(options = {}) {
        const experienceId = this.startExperience('discussion', {
            type: 'think-pair-share',
            topic: options.topic || 'Current topic',
            steps: this.discussionTools.thinkPairShare.steps,
            timers: options.timers || this.discussionTools.thinkPairShare.timers
        });

        const discussion = this.discussionTools.thinkPairShare;
        discussion.currentStep = 0;
        discussion.topic = options.topic;

        // Start first step
        this.advanceDiscussionStep(experienceId);
    }

    /**
     * Advance discussion step
     * @param {string} experienceId - Experience ID
     */
    advanceDiscussionStep(experienceId) {
        const discussion = this.discussionTools.thinkPairShare;
        const experience = this.activeExperiences.get(experienceId);

        if (discussion.currentStep >= discussion.steps.length) {
            // Discussion complete
            this.endExperience(experienceId);
            return;
        }

        const step = discussion.steps[discussion.currentStep];
        const timer = discussion.timers[discussion.currentStep];

        // Update UI
        this.updateDiscussionUI(step, timer);

        // Start timer
        discussion.timer = setTimeout(() => {
            discussion.currentStep++;
            this.advanceDiscussionStep(experienceId);
        }, timer * 1000);

        console.log(`🗣️ Discussion step: ${step} (${timer}s)`);
    }

    /**
     * Update discussion UI
     * @param {string} step - Current step
     * @param {number} timer - Timer duration
     */
    updateDiscussionUI(step, timer) {
        const discussionContainer = document.getElementById('classroom-discussion');
        if (discussionContainer) {
            discussionContainer.innerHTML = `
                <div class="discussion-step">
                    <h3>${step}</h3>
                    <div class="timer">${timer}s</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            `;

            // Animate progress bar
            const progressFill = discussionContainer.querySelector('.progress-fill');
            const startTime = Date.now();
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = (elapsed / timer) * 100;
                progressFill.style.width = `${Math.min(progress, 100)}%`;
                
                if (elapsed < timer) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }
    }

    /**
     * Start Circle Time
     */
    startCircleTime() {
        const experienceId = this.startExperience('discussion', {
            type: 'circle-time',
            format: this.discussionTools.circleTime.format,
            guidelines: this.discussionTools.circleTime.guidelines
        });

        this.discussionTools.circleTime.active = true;

        // Update UI
        const discussionContainer = document.getElementById('classroom-discussion');
        if (discussionContainer) {
            discussionContainer.innerHTML = `
                <div class="circle-time">
                    <h3>Circle Time</h3>
                    <p>${this.discussionTools.circleTime.format}</p>
                    <ul class="guidelines">
                        ${this.discussionTools.circleTime.guidelines.map(guideline => 
                            `<li>${guideline}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }

    /**
     * Start Quick Check
     */
    startQuickCheck() {
        const experienceId = this.startExperience('feedback', {
            type: 'quick-check',
            options: this.discussionTools.quickCheck.options
        });

        // Update UI
        const discussionContainer = document.getElementById('classroom-discussion');
        if (discussionContainer) {
            discussionContainer.innerHTML = `
                <div class="quick-check">
                    <h3>How are you feeling?</h3>
                    <div class="quick-check-options">
                        ${this.discussionTools.quickCheck.options.map((option, index) => `
                            <button class="quick-check-btn" onclick="window.ExperientialClassroom.selectQuickCheckOption(${index})">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Select quick check option
     * @param {number} optionIndex - Option index
     */
    selectQuickCheckOption(optionIndex) {
        const option = this.discussionTools.quickCheck.options[optionIndex];
        this.discussionTools.quickCheck.responses.set(Date.now(), option);

        // Update UI to show selection
        const discussionContainer = document.getElementById('classroom-discussion');
        if (discussionContainer) {
            discussionContainer.innerHTML = `
                <div class="quick-check-result">
                    <h3>Thank you!</h3>
                    <p>You selected: <strong>${option}</strong></p>
                </div>
            `;
        }

        console.log(`✅ Quick check response: ${option}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for global SEL events
        if (window.ExperientialSEL) {
            window.ExperientialSEL.on('experience:start', (data) => {
                console.log('🎯 Experience started in classroom:', data.type);
            });

            window.ExperientialSEL.on('experience:end', (data) => {
                console.log('✅ Experience completed in classroom:', data.experienceId);
            });
        }
    }

    /**
     * Get classroom statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        if (!this.currentSession) {
            return { error: 'No active session' };
        }

        return {
            sessionId: this.currentSession.id,
            duration: Date.now() - this.currentSession.startTime,
            participants: this.currentSession.participants.size,
            experiences: this.currentSession.experiences.length,
            activeExperiences: this.activeExperiences.size,
            moodHistory: this.currentSession.moodHistory.length,
            energyHistory: this.currentSession.energyHistory.length
        };
    }

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getCurrentState() {
        return {
            session: this.currentSession,
            activeExperiences: Array.from(this.activeExperiences.values()),
            participants: Array.from(this.participants),
            discussionTools: this.discussionTools
        };
    }
}

// Global instance
window.ExperientialClassroom = new ExperientialClassroom();

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperientialClassroom;
} 