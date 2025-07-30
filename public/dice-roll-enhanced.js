// Enhanced Dice Roll Module with Lottie-style Animations
// Provides smooth, engaging dice roll animations with physics and visual effects

class EnhancedDiceRoll {
    constructor() {
        this.isRolling = false;
        this.audioContext = null;
        this.currentFace = 1;
        this.animationDuration = 3000; // Increased for more fluid animation
        this.bounceIntensity = 0.4;
        this.spinIntensity = 1.2;
        
        // Animation timing functions - more Lottie-like
        this.easing = {
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
            lottie: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Lottie-style easing
            fluid: 'cubic-bezier(0.4, 0, 0.2, 1)' // Fluid motion
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
            /* Enhanced Dice Roll Animations - Lottie Style */
            .dice-enhanced {
                transform-style: preserve-3d;
                transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                filter: drop-shadow(0 8px 25px rgba(0,0,0,0.15));
            }
            
            .dice-enhanced.rolling {
                animation: lottie-tumble 3s cubic-bezier(0.25, 0.1, 0.25, 1);
            }
            
            .dice-enhanced.bouncing {
                animation: lottie-bounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .dice-enhanced.settling {
                animation: lottie-settle 1s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .dice-enhanced.celebrating {
                animation: lottie-celebration 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .dice-enhanced.shaking {
                animation: lottie-shake 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
            }
            
            .dice-enhanced.glowing {
                position: relative;
                filter: drop-shadow(0 0 20px rgba(255, 210, 63, 0.6)) drop-shadow(0 8px 25px rgba(0,0,0,0.15));
            }
            
            .dice-enhanced.glowing::before {
                content: '';
                position: absolute;
                top: -15px;
                left: -15px;
                right: -15px;
                bottom: -15px;
                background: radial-gradient(circle, rgba(255, 210, 63, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: lottie-glow 0.8s ease-in-out infinite alternate;
                z-index: -1;
            }
            
            /* Lottie-style Tumble Animation - More Fluid */
            @keyframes lottie-tumble {
                0% {
                    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1) translateY(0px);
                }
                10% {
                    transform: rotateX(90deg) rotateY(45deg) rotateZ(30deg) scale(1.05) translateY(-10px);
                }
                25% {
                    transform: rotateX(270deg) rotateY(135deg) rotateZ(90deg) scale(0.95) translateY(5px);
                }
                40% {
                    transform: rotateX(450deg) rotateY(225deg) rotateZ(150deg) scale(1.08) translateY(-8px);
                }
                55% {
                    transform: rotateX(630deg) rotateY(315deg) rotateZ(210deg) scale(0.92) translateY(3px);
                }
                70% {
                    transform: rotateX(810deg) rotateY(405deg) rotateZ(270deg) scale(1.03) translateY(-5px);
                }
                85% {
                    transform: rotateX(990deg) rotateY(495deg) rotateZ(330deg) scale(0.97) translateY(2px);
                }
                100% {
                    transform: rotateX(1170deg) rotateY(585deg) rotateZ(360deg) scale(1) translateY(0px);
                }
            }
            
            /* Lottie-style Bounce Animation */
            @keyframes lottie-bounce {
                0%, 100% {
                    transform: translateY(0px) scale(1) rotate(0deg);
                }
                20% {
                    transform: translateY(-25px) scale(1.1) rotate(2deg);
                }
                40% {
                    transform: translateY(-15px) scale(0.95) rotate(-1deg);
                }
                60% {
                    transform: translateY(-8px) scale(1.05) rotate(0.5deg);
                }
                80% {
                    transform: translateY(-3px) scale(0.98) rotate(-0.25deg);
                }
            }
            
            /* Lottie-style Settle Animation */
            @keyframes lottie-settle {
                0% {
                    transform: scale(1.1) rotate(3deg);
                }
                30% {
                    transform: scale(0.95) rotate(-2deg);
                }
                60% {
                    transform: scale(1.03) rotate(1deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            
            /* Lottie-style Celebration Animation */
            @keyframes lottie-celebration {
                0% {
                    transform: scale(1) rotate(0deg);
                }
                15% {
                    transform: scale(1.4) rotate(5deg);
                }
                30% {
                    transform: scale(0.85) rotate(-3deg);
                }
                45% {
                    transform: scale(1.25) rotate(2deg);
                }
                60% {
                    transform: scale(0.9) rotate(-1deg);
                }
                75% {
                    transform: scale(1.15) rotate(0.5deg);
                }
                100% {
                    transform: scale(1) rotate(0deg);
                }
            }
            
            /* Lottie-style Shake Animation */
            @keyframes lottie-shake {
                0%, 100% {
                    transform: translateX(0px) rotate(0deg);
                }
                10% {
                    transform: translateX(-8px) rotate(-3deg);
                }
                20% {
                    transform: translateX(8px) rotate(3deg);
                }
                30% {
                    transform: translateX(-6px) rotate(-2deg);
                }
                40% {
                    transform: translateX(6px) rotate(2deg);
                }
                50% {
                    transform: translateX(-4px) rotate(-1deg);
                }
                60% {
                    transform: translateX(4px) rotate(1deg);
                }
                70% {
                    transform: translateX(-2px) rotate(-0.5deg);
                }
                80% {
                    transform: translateX(2px) rotate(0.5deg);
                }
                90% {
                    transform: translateX(-1px) rotate(-0.25deg);
                }
            }
            
            /* Lottie-style Glow Animation */
            @keyframes lottie-glow {
                0% {
                    opacity: 0.3;
                    transform: scale(1);
                }
                100% {
                    opacity: 0.8;
                    transform: scale(1.3);
                }
            }
            
            /* Enhanced Particle Effects */
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
                width: 8px;
                height: 8px;
                background: linear-gradient(45deg, #ffd23f, #ff6b35);
                border-radius: 50%;
                animation: lottie-particle 2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
            }
            
            @keyframes lottie-particle {
                0% {
                    opacity: 1;
                    transform: translateY(0px) scale(1) rotate(0deg);
                }
                50% {
                    opacity: 0.8;
                    transform: translateY(-30px) scale(1.2) rotate(180deg);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-60px) scale(0) rotate(360deg);
                }
            }
            
            /* Enhanced Result Display */
            #prompt-result {
                position: relative;
                transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 20px;
                margin-top: 20px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            #prompt-result.celebrating {
                animation: lottie-celebration 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                background: linear-gradient(135deg, rgba(255, 210, 63, 0.1), rgba(255, 107, 53, 0.1));
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
            console.log('Starting Lottie-style roll for face:', targetFace);
            
            // Phase 1: Initial shake with Lottie-style timing
            dice.classList.add('shaking');
            this.playEnhancedSound('shake');
            
            setTimeout(() => {
                dice.classList.remove('shaking');
                
                // Phase 2: Lottie-style tumble with enhanced glow
                dice.classList.add('rolling');
                dice.classList.add('glowing');
                
                setTimeout(() => {
                    dice.classList.remove('rolling');
                    
                    // Phase 3: Lottie-style bounce with rotation
                    dice.classList.add('bouncing');
                    this.playEnhancedSound('bounce');
                    
                    setTimeout(() => {
                        dice.classList.remove('bouncing');
                        
                        // Phase 4: Lottie-style settle to final position
                        this.setDiceFace(dice, targetFace);
                        dice.classList.add('settling');
                        
                        setTimeout(() => {
                            dice.classList.remove('settling', 'glowing');
                            
                            // Phase 5: Celebration effect
                            dice.classList.add('celebrating');
                            this.playEnhancedSound('success');
                            
                            setTimeout(() => {
                                dice.classList.remove('celebrating');
                                console.log('Lottie-style roll completed');
                                resolve();
                            }, 1500);
                        }, 1000);
                    }, 800);
                }, 3000);
            }, 600);
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
            
            console.log('Enhanced dice initialized:', dice);
        } else {
            console.log('No dice element found for enhancement');
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