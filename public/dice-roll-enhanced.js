// Enhanced Dice Roll Module with Lottie-style Animations
// Provides smooth, engaging dice roll animations with physics and visual effects

class EnhancedDiceRoll {
    constructor() {
        this.isRolling = false;
        this.audioContext = null;
        this.currentFace = 1;
        this.animationDuration = 2500;
        this.bounceIntensity = 0.3;
        this.spinIntensity = 0.8;
        
        // Animation timing functions
        this.easing = {
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            sharp: 'cubic-bezier(0.4, 0, 0.2, 1)'
        };
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.createAnimationStyles();
        this.setupEventListeners();
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
    
    createAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Dice Roll Animations */
            .dice-enhanced {
                transform-style: preserve-3d;
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
            }
            
            .dice-enhanced.rolling {
                animation: enhanced-tumble 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .dice-enhanced.bouncing {
                animation: enhanced-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .dice-enhanced.settling {
                animation: enhanced-settle 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .dice-enhanced.celebrating {
                animation: enhanced-celebration 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            /* Enhanced Tumble Animation */
            @keyframes enhanced-tumble {
                0% {
                    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
                }
                15% {
                    transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg) scale(1.1);
                }
                30% {
                    transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg) scale(0.95);
                }
                45% {
                    transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg) scale(1.05);
                }
                60% {
                    transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg) scale(0.98);
                }
                75% {
                    transform: rotateX(900deg) rotateY(450deg) rotateZ(225deg) scale(1.02);
                }
                90% {
                    transform: rotateX(1080deg) rotateY(540deg) rotateZ(270deg) scale(0.99);
                }
                100% {
                    transform: rotateX(1260deg) rotateY(630deg) rotateZ(315deg) scale(1);
                }
            }
            
            /* Enhanced Bounce Animation */
            @keyframes enhanced-bounce {
                0%, 100% {
                    transform: translateY(0px) scale(1);
                }
                25% {
                    transform: translateY(-15px) scale(1.05);
                }
                50% {
                    transform: translateY(-25px) scale(1.1);
                }
                75% {
                    transform: translateY(-10px) scale(1.03);
                }
            }
            
            /* Enhanced Settle Animation */
            @keyframes enhanced-settle {
                0% {
                    transform: scale(1.1) rotate(5deg);
                }
                50% {
                    transform: scale(0.95) rotate(-2deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            
            /* Enhanced Celebration Animation */
            @keyframes enhanced-celebration {
                0% {
                    transform: scale(1) rotate(0deg);
                }
                25% {
                    transform: scale(1.2) rotate(5deg);
                }
                50% {
                    transform: scale(0.9) rotate(-3deg);
                }
                75% {
                    transform: scale(1.1) rotate(2deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            
            /* Particle Effects */
            .dice-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10;
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffd23f 0%, #ff6b35 100%);
                border-radius: 50%;
                animation: particle-float 2s ease-out forwards;
            }
            
            @keyframes particle-float {
                0% {
                    opacity: 1;
                    transform: translateY(0px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0);
                }
            }
            
            /* Glow Effects */
            .dice-enhanced.rolling::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                background: radial-gradient(circle, rgba(255, 210, 63, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: glow-pulse 0.5s ease-in-out infinite alternate;
            }
            
            @keyframes glow-pulse {
                0% {
                    opacity: 0.3;
                    transform: scale(1);
                }
                100% {
                    opacity: 0.6;
                    transform: scale(1.1);
                }
            }
            
            /* Shake Effect */
            .dice-enhanced.shaking {
                animation: enhanced-shake 0.5s cubic-bezier(0.36, 0, 0.66, 1);
            }
            
            @keyframes enhanced-shake {
                0%, 100% {
                    transform: translateX(0px) rotate(0deg);
                }
                25% {
                    transform: translateX(-5px) rotate(-2deg);
                }
                50% {
                    transform: translateX(5px) rotate(2deg);
                }
                75% {
                    transform: translateX(-3px) rotate(-1deg);
                }
            }
            
            /* Face-specific animations */
            .dice-face {
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .dice-face::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transition: left 0.6s ease;
            }
            
            .dice-face.highlighted::before {
                left: 100%;
            }
            
            /* Enhanced 3D Transform */
            .dice-enhanced {
                transform-style: preserve-3d;
                perspective: 1000px;
            }
            
            .dice-face {
                backface-visibility: hidden;
                transform-style: preserve-3d;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Add global event listeners for enhanced interactions
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.roll();
            }
        });
    }
    
    async roll() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const dice = document.querySelector('.dice-enhanced') || document.querySelector('.dice');
        const resultEl = document.getElementById('prompt-result');
        
        if (!dice) {
            console.error('Dice element not found');
            return;
        }
        
        // Clear previous result
        if (resultEl) {
            resultEl.textContent = '';
            resultEl.style.opacity = '0';
        }
        
        // Generate random face
        const newFace = Math.floor(Math.random() * 6) + 1;
        
        // Play enhanced sound
        this.playEnhancedSound('roll');
        
        // Start enhanced animation sequence
        await this.performEnhancedRoll(dice, newFace);
        
        // Show result with celebration
        this.showResult(newFace, resultEl);
        
        this.isRolling = false;
    }
    
    async performEnhancedRoll(dice, targetFace) {
        return new Promise((resolve) => {
            // Phase 1: Initial shake
            dice.classList.add('shaking');
            
            setTimeout(() => {
                dice.classList.remove('shaking');
                
                // Phase 2: Enhanced tumble with glow
                dice.classList.add('rolling', 'enhanced-tumble');
                dice.classList.add('glowing');
                
                setTimeout(() => {
                    dice.classList.remove('rolling', 'enhanced-tumble');
                    
                    // Phase 3: Bounce effect
                    dice.classList.add('bouncing');
                    
                    setTimeout(() => {
                        dice.classList.remove('bouncing');
                        
                        // Phase 4: Settle to final position
                        this.setDiceFace(dice, targetFace);
                        dice.classList.add('settling');
                        
                        setTimeout(() => {
                            dice.classList.remove('settling', 'glowing');
                            resolve();
                        }, 800);
                    }, 600);
                }, 2500);
            }, 500);
        });
    }
    
    setDiceFace(dice, face) {
        const transforms = {
            1: 'rotateY(0deg)',
            2: 'rotateY(-90deg)',
            3: 'rotateY(-180deg)',
            4: 'rotateY(90deg)',
            5: 'rotateX(-90deg)',
            6: 'rotateX(90deg)'
        };
        
        dice.style.transform = transforms[face];
        this.currentFace = face;
    }
    
    showResult(face, resultEl) {
        if (!resultEl) return;
        
        // Get the prompt for this face
        const prompts = this.getPrompts();
        const prompt = prompts[face - 1];
        
        // Create particle effect
        this.createParticleEffect(resultEl);
        
        // Show result with enhanced animation
        resultEl.style.opacity = '0';
        resultEl.style.transform = 'translateY(20px)';
        resultEl.textContent = prompt;
        
        // Animate result appearance
        setTimeout(() => {
            resultEl.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            resultEl.style.opacity = '1';
            resultEl.style.transform = 'translateY(0px)';
            
            // Add celebration effect
            resultEl.classList.add('celebrating');
            
            setTimeout(() => {
                resultEl.classList.remove('celebrating');
            }, 1200);
        }, 200);
        
        // Play celebration sound
        this.playEnhancedSound('success');
    }
    
    createParticleEffect(element) {
        const particles = document.createElement('div');
        particles.className = 'dice-particles';
        
        // Create multiple particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particles.appendChild(particle);
        }
        
        element.appendChild(particles);
        
        // Remove particles after animation
        setTimeout(() => {
            particles.remove();
        }, 2000);
    }
    
    getPrompts() {
        // Get prompts from the current dice faces or fallback
        const faces = document.querySelectorAll('.dice-face, .face');
        if (faces.length >= 6) {
            return Array.from(faces).slice(0, 6).map(face => face.textContent);
        }
        
        // Fallback prompts
        return [
            "How are you feeling today?",
            "What made you smile this week?",
            "Share a time you helped someone",
            "What's something you're proud of?",
            "How do you handle difficult emotions?",
            "What's a goal you're working toward?"
        ];
    }
    
    playEnhancedSound(type) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            switch (type) {
                case 'roll':
                    // Rolling sound with multiple frequencies
                    oscillator.frequency.setValueAtTime(200, now);
                    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;
                    
                case 'success':
                    // Success sound with ascending tones
                    oscillator.frequency.setValueAtTime(523, now); // C5
                    oscillator.frequency.exponentialRampToValueAtTime(659, now + 0.1); // E5
                    oscillator.frequency.exponentialRampToValueAtTime(784, now + 0.2); // G5
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;
                    
                case 'bounce':
                    // Bounce sound
                    oscillator.frequency.setValueAtTime(300, now);
                    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.1);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
            }
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    }
    
    // Public methods for external use
    enhanceExistingDice() {
        const dice = document.querySelector('.dice');
        if (dice) {
            dice.classList.add('dice-enhanced');
            
            // Enhance faces
            const faces = dice.querySelectorAll('.face');
            faces.forEach(face => {
                face.classList.add('dice-face');
            });
        }
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRolling) {
                e.preventDefault();
                this.roll();
            }
        });
    }
    
    // Configuration methods
    setAnimationDuration(duration) {
        this.animationDuration = duration;
    }
    
    setBounceIntensity(intensity) {
        this.bounceIntensity = intensity;
    }
    
    setSpinIntensity(intensity) {
        this.spinIntensity = intensity;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedDiceRoll = new EnhancedDiceRoll();
    
    // Enhance existing dice if present
    setTimeout(() => {
        window.enhancedDiceRoll.enhanceExistingDice();
    }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedDiceRoll;
} 