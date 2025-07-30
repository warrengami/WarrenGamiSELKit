// Progressive Disclosure Module
// Reduces cognitive load by showing only relevant information based on user role and experience

const ProgressiveDisclosure = {
    // User experience levels
    experienceLevels: {
        beginner: 'beginner',
        intermediate: 'intermediate',
        advanced: 'advanced'
    },
    
    // User roles
    userRoles: {
        teacher: 'teacher',
        counselor: 'counselor',
        specialist: 'specialist',
        administrator: 'administrator'
    },
    
    // Content visibility rules
    contentRules: {
        beginner: {
            show: ['quick-start', 'basic-activities', 'timer', 'help'],
            hide: ['advanced-features', 'data-analytics', 'customization']
        },
        intermediate: {
            show: ['quick-start', 'basic-activities', 'advanced-activities', 'timer', 'data-basic'],
            hide: ['advanced-analytics', 'customization']
        },
        advanced: {
            show: ['all'],
            hide: []
        }
    },
    
    // Role-specific content
    roleContent: {
        teacher: {
            primary: ['classroom-activities', 'timer', 'assessment'],
            secondary: ['professional-development', 'resources']
        },
        counselor: {
            primary: ['individual-activities', 'assessment', 'data-analytics'],
            secondary: ['group-activities', 'resources']
        },
        specialist: {
            primary: ['advanced-activities', 'data-analytics', 'customization'],
            secondary: ['training', 'resources']
        }
    },
    
    // Initialize progressive disclosure
    init: function() {
        this.setupUserPreferences();
        this.applyContentRules();
        this.setupRoleSelector();
        this.setupExperienceSelector();
        this.addProgressiveHelp();
        
        console.log('Progressive disclosure initialized');
    },
    
    // Setup user preferences from localStorage
    setupUserPreferences: function() {
        this.currentRole = localStorage.getItem('userRole') || 'teacher';
        this.currentExperience = localStorage.getItem('userExperience') || 'beginner';
        this.firstTimeUser = !localStorage.getItem('hasVisited');
        
        if (this.firstTimeUser) {
            this.showOnboarding();
        }
    },
    
    // Apply content visibility rules
    applyContentRules: function() {
        const rules = this.contentRules[this.currentExperience];
        const roleContent = this.roleContent[this.currentRole];
        
        // Hide all content first
        this.hideAllContent();
        
        // Show content based on experience level
        if (rules.show.includes('all')) {
            this.showAllContent();
        } else {
            rules.show.forEach(contentType => {
                this.showContentByType(contentType);
            });
        }
        
        // Apply role-specific content
        if (roleContent) {
            roleContent.primary.forEach(contentType => {
                this.highlightContentByType(contentType);
            });
        }
        
        // Hide content based on rules
        rules.hide.forEach(contentType => {
            this.hideContentByType(contentType);
        });
    },
    
    // Hide all content sections
    hideAllContent: function() {
        const sections = document.querySelectorAll('[data-content-type]');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    },
    
    // Show all content sections
    showAllContent: function() {
        const sections = document.querySelectorAll('[data-content-type]');
        sections.forEach(section => {
            section.style.display = 'block';
        });
    },
    
    // Show content by type
    showContentByType: function(contentType) {
        const sections = document.querySelectorAll(`[data-content-type="${contentType}"]`);
        sections.forEach(section => {
            section.style.display = 'block';
        });
    },
    
    // Hide content by type
    hideContentByType: function(contentType) {
        const sections = document.querySelectorAll(`[data-content-type="${contentType}"]`);
        sections.forEach(section => {
            section.style.display = 'none';
        });
    },
    
    // Highlight content by type (for role-specific content)
    highlightContentByType: function(contentType) {
        const sections = document.querySelectorAll(`[data-content-type="${contentType}"]`);
        sections.forEach(section => {
            section.classList.add('role-highlight');
        });
    },
    
    // Setup role selector
    setupRoleSelector: function() {
        const roleSelectors = document.querySelectorAll('.role-btn, [data-role-selector]');
        roleSelectors.forEach(selector => {
            selector.addEventListener('click', (e) => {
                const role = e.target.getAttribute('data-role') || e.target.textContent.toLowerCase().replace(/\s+/g, '');
                this.setUserRole(role);
            });
        });
    },
    
    // Setup experience level selector
    setupExperienceSelector: function() {
        const experienceSelectors = document.querySelectorAll('[data-experience-selector]');
        experienceSelectors.forEach(selector => {
            selector.addEventListener('change', (e) => {
                const experience = e.target.value;
                this.setUserExperience(experience);
            });
        });
    },
    
    // Set user role
    setUserRole: function(role) {
        this.currentRole = role;
        localStorage.setItem('userRole', role);
        
        // Update UI
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Reapply content rules
        this.applyContentRules();
        
        // Show role-specific guidance
        this.showRoleGuidance(role);
    },
    
    // Set user experience level
    setUserExperience: function(experience) {
        this.currentExperience = experience;
        localStorage.setItem('userExperience', experience);
        
        // Reapply content rules
        this.applyContentRules();
        
        // Show experience-specific guidance
        this.showExperienceGuidance(experience);
    },
    
    // Show onboarding for first-time users
    showOnboarding: function() {
        const onboarding = document.createElement('div');
        onboarding.className = 'onboarding-overlay';
        onboarding.innerHTML = `
            <div class="onboarding-modal">
                <h2>Welcome to WarrenGami SEL! 🎉</h2>
                <p>Let's personalize your experience to help you get started quickly.</p>
                
                <div class="onboarding-step">
                    <h3>What's your role?</h3>
                    <div class="role-options">
                        <button class="role-option" data-role="teacher">👨‍🏫 Classroom Teacher</button>
                        <button class="role-option" data-role="counselor">🧠 School Counselor</button>
                        <button class="role-option" data-role="specialist">🌟 SEL Specialist</button>
                    </div>
                </div>
                
                <div class="onboarding-step">
                    <h3>What's your SEL experience level?</h3>
                    <div class="experience-options">
                        <button class="experience-option" data-experience="beginner">🌱 New to SEL</button>
                        <button class="experience-option" data-experience="intermediate">🌿 Some Experience</button>
                        <button class="experience-option" data-experience="advanced">🌳 SEL Expert</button>
                    </div>
                </div>
                
                <button class="onboarding-continue" onclick="ProgressiveDisclosure.completeOnboarding()">Get Started</button>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .onboarding-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .onboarding-modal {
                background: white;
                padding: 2em;
                border-radius: 15px;
                max-width: 500px;
                text-align: center;
            }
            .role-options, .experience-options {
                display: grid;
                gap: 1em;
                margin: 1em 0;
            }
            .role-option, .experience-option {
                padding: 1em;
                border: 2px solid #e0e6ed;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .role-option:hover, .experience-option:hover {
                border-color: #73bdf5;
                background: #f7f9fc;
            }
            .role-option.selected, .experience-option.selected {
                border-color: #73bdf5;
                background: #cfe9ff;
            }
            .onboarding-continue {
                background: #73bdf5;
                color: white;
                border: none;
                padding: 1em 2em;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 1em;
            }
        `;
        document.head.appendChild(styles);
        document.body.appendChild(onboarding);
        
        // Add event listeners
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedRole = e.target.getAttribute('data-role');
            });
        });
        
        document.querySelectorAll('.experience-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.experience-option').forEach(o => o.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedExperience = e.target.getAttribute('data-experience');
            });
        });
    },
    
    // Complete onboarding
    completeOnboarding: function() {
        if (this.selectedRole) {
            this.setUserRole(this.selectedRole);
        }
        if (this.selectedExperience) {
            this.setUserExperience(this.selectedExperience);
        }
        
        localStorage.setItem('hasVisited', 'true');
        document.querySelector('.onboarding-overlay').remove();
    },
    
    // Show role-specific guidance
    showRoleGuidance: function(role) {
        const guidance = {
            teacher: {
                title: "Classroom Teacher Tips",
                tips: [
                    "Start with the Quick Start Guide for your first activity",
                    "Use the timer feature to keep activities focused",
                    "Try the Emotions & Feelings Dice for morning meetings",
                    "Print scenario cards for small group discussions"
                ]
            },
            counselor: {
                title: "School Counselor Tips",
                tips: [
                    "Use individual activities for one-on-one sessions",
                    "Track progress with the assessment tools",
                    "Try the Self-Awareness activities for personal growth",
                    "Use scenario cards for group counseling sessions"
                ]
            },
            specialist: {
                title: "SEL Specialist Tips",
                tips: [
                    "Explore advanced activities for deeper learning",
                    "Use data analytics to track program effectiveness",
                    "Customize activities for specific student needs",
                    "Train other educators using the professional development resources"
                ]
            }
        };
        
        if (guidance[role]) {
            this.showTipCard(guidance[role]);
        }
    },
    
    // Show experience-specific guidance
    showExperienceGuidance: function(experience) {
        const guidance = {
            beginner: {
                title: "Getting Started",
                tips: [
                    "Start with the Quick Start Guide",
                    "Try one activity at a time",
                    "Use the built-in timer for structure",
                    "Don't worry about getting it perfect - just start!"
                ]
            },
            intermediate: {
                title: "Building Your Practice",
                tips: [
                    "Try different types of activities",
                    "Use assessment tools to track progress",
                    "Explore the professional development resources",
                    "Consider integrating SEL into your curriculum"
                ]
            },
            advanced: {
                title: "Advanced Implementation",
                tips: [
                    "Customize activities for your specific needs",
                    "Use data analytics to measure impact",
                    "Train other educators in your school",
                    "Share your experiences and feedback"
                ]
            }
        };
        
        if (guidance[experience]) {
            this.showTipCard(guidance[experience]);
        }
    },
    
    // Show tip card
    showTipCard: function(guidance) {
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.innerHTML = `
            <h3>💡 ${guidance.title}</h3>
            <ul>
                ${guidance.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
            <button onclick="this.parentElement.remove()">Got it!</button>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#tip-card-styles')) {
            const styles = document.createElement('style');
            styles.id = 'tip-card-styles';
            styles.textContent = `
                .tip-card {
                    background: linear-gradient(135deg, #73bdf5, #0f2c4d);
                    color: white;
                    padding: 1.5em;
                    border-radius: 12px;
                    margin: 1em 0;
                    position: relative;
                }
                .tip-card h3 {
                    margin: 0 0 1em 0;
                }
                .tip-card ul {
                    margin: 0 0 1em 0;
                    padding-left: 1.5em;
                }
                .tip-card li {
                    margin-bottom: 0.5em;
                }
                .tip-card button {
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 0.5em 1em;
                    border-radius: 6px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to page
        const container = document.querySelector('.main-content') || document.querySelector('.container');
        if (container) {
            container.insertBefore(tipCard, container.firstChild);
        }
    },
    
    // Add progressive help system
    addProgressiveHelp: function() {
        // Add help tooltips to complex features
        const helpElements = document.querySelectorAll('[data-help]');
        helpElements.forEach(element => {
            const helpText = element.getAttribute('data-help');
            element.addEventListener('mouseenter', () => {
                this.showTooltip(element, helpText);
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    },
    
    // Show tooltip
    showTooltip: function(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'progressive-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 0.5em;
            border-radius: 4px;
            font-size: 0.9em;
            z-index: 1000;
            max-width: 200px;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    },
    
    // Hide tooltip
    hideTooltip: function() {
        const tooltip = document.querySelector('.progressive-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ProgressiveDisclosure.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressiveDisclosure;
} 