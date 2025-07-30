// Cultural Inclusion Enhancement Module
// This module provides culturally diverse scenarios and inclusive content

const CulturalInclusion = {
    // Diverse family structures for scenarios
    familyStructures: [
        "two parents",
        "single parent",
        "grandparents",
        "same-sex parents",
        "blended family",
        "foster family",
        "adoptive family",
        "extended family living together"
    ],
    
    // Cultural celebrations and traditions
    culturalCelebrations: [
        "Diwali",
        "Chinese New Year",
        "Ramadan",
        "Hanukkah",
        "Christmas",
        "Eid al-Fitr",
        "Day of the Dead",
        "Kwanzaa",
        "Holi",
        "Thanksgiving"
    ],
    
    // Inclusive names from various cultures
    diverseNames: [
        "Aisha", "Ahmed", "Bella", "Carlos", "Fatima", "Hiroshi", "Isabella", "Javier",
        "Kai", "Layla", "Miguel", "Nina", "Omar", "Priya", "Ravi", "Sofia", "Tariq",
        "Uma", "Vikram", "Yuki", "Zara"
    ],
    
    // Multilingual emotion words (basic support)
    multilingualEmotions: {
        spanish: {
            happy: "feliz",
            sad: "triste",
            angry: "enojado",
            excited: "emocionado",
            nervous: "nervioso",
            proud: "orgulloso"
        },
        french: {
            happy: "heureux",
            sad: "triste",
            angry: "fâché",
            excited: "excité",
            nervous: "nerveux",
            proud: "fier"
        }
    },
    
    // Generate culturally diverse scenarios
    generateDiverseScenario: function(baseScenario, options = {}) {
        const family = options.family || this.getRandomItem(this.familyStructures);
        const name = options.name || this.getRandomItem(this.diverseNames);
        const celebration = options.celebration || this.getRandomItem(this.culturalCelebrations);
        
        return baseScenario
            .replace(/\{family\}/g, family)
            .replace(/\{name\}/g, name)
            .replace(/\{celebration\}/g, celebration);
    },
    
    // Get random item from array
    getRandomItem: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Add cultural context to existing scenarios
    enhanceScenarioWithCulture: function(scenario) {
        const culturalElements = [
            "Your family celebrates {celebration}",
            "You and your {family} are planning a special meal",
            "Your friend {name} is sharing their cultural tradition",
            "Your {family} is preparing for a cultural celebration",
            "You're learning about {name}'s family traditions"
        ];
        
        const culturalElement = this.getRandomItem(culturalElements);
        const enhancedScenario = culturalElement + ". " + scenario;
        
        return this.generateDiverseScenario(enhancedScenario);
    },
    
    // Create inclusive dice prompts
    createInclusivePrompts: function(basePrompts) {
        return basePrompts.map(prompt => {
            // Add cultural diversity to prompts
            if (prompt.includes("friend")) {
                return prompt.replace("friend", "friend {name}");
            }
            if (prompt.includes("family")) {
                return prompt.replace("family", "{family}");
            }
            return prompt;
        });
    },
    
    // Language support functions
    translateEmotion: function(emotion, language) {
        if (this.multilingualEmotions[language] && this.multilingualEmotions[language][emotion]) {
            return this.multilingualEmotions[language][emotion];
        }
        return emotion; // Fallback to English
    },
    
    // Add language toggle functionality
    addLanguageSupport: function() {
        const languageToggle = document.createElement('div');
        languageToggle.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                <select id="language-selector" style="padding: 8px; border-radius: 6px; border: 1px solid #ccc;">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
        `;
        document.body.appendChild(languageToggle);
        
        // Language change handler
        document.getElementById('language-selector').addEventListener('change', function() {
            const language = this.value;
            CulturalInclusion.switchLanguage(language);
        });
    },
    
    // Switch language (basic implementation)
    switchLanguage: function(language) {
        // This would integrate with a translation system
        console.log('Switching to language:', language);
        
        // Update UI elements based on language
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            // In a full implementation, this would use a translation dictionary
            element.textContent = `[${language.toUpperCase()}] ${element.textContent}`;
        });
    },
    
    // Initialize cultural inclusion features
    init: function() {
        // Add language support if not already present
        if (!document.getElementById('language-selector')) {
            this.addLanguageSupport();
        }
        
        // Enhance existing scenarios with cultural diversity
        this.enhanceExistingContent();
        
        console.log('Cultural inclusion features initialized');
    },
    
    // Enhance existing content on the page
    enhanceExistingContent: function() {
        // Find scenario elements and enhance them
        const scenarioElements = document.querySelectorAll('.scenario-text, .dice-prompt');
        scenarioElements.forEach(element => {
            if (element.textContent && !element.hasAttribute('data-enhanced')) {
                const originalText = element.textContent;
                const enhancedText = this.enhanceScenarioWithCulture(originalText);
                element.textContent = enhancedText;
                element.setAttribute('data-enhanced', 'true');
            }
        });
    },
    
    // Create culturally diverse dice
    createDiverseDice: function() {
        const diversePrompts = [
            "How does your {family} show love?",
            "What cultural tradition does {name} celebrate?",
            "How do you help a friend from a different culture?",
            "What does your {family} do during {celebration}?",
            "How do you respect different cultural practices?",
            "What can you learn from {name}'s family traditions?"
        ];
        
        return diversePrompts.map(prompt => this.generateDiverseScenario(prompt));
    },
    
    // Add cultural inclusion section to dashboard
    addCulturalSection: function() {
        const culturalSection = document.createElement('section');
        culturalSection.className = 'cultural-inclusion';
        culturalSection.innerHTML = `
            <h3>🌍 Inclusive SEL Resources</h3>
            <p>Resources designed to support diverse classrooms and cultural backgrounds</p>
            <div class="inclusion-features">
                <div class="inclusion-feature">
                    <h4>🌐 Multilingual Support</h4>
                    <p>Available in English, Spanish, and French</p>
                </div>
                <div class="inclusion-feature">
                    <h4>👥 Diverse Scenarios</h4>
                    <p>Inclusive family structures and cultural celebrations</p>
                </div>
                <div class="inclusion-feature">
                    <h4>🎨 Cultural Activities</h4>
                    <p>Celebrating diverse traditions and practices</p>
                </div>
            </div>
        `;
        
        // Add to dashboard if it exists
        const dashboard = document.querySelector('.main-content') || document.querySelector('.container');
        if (dashboard) {
            dashboard.appendChild(culturalSection);
        }
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CulturalInclusion.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CulturalInclusion;
} 