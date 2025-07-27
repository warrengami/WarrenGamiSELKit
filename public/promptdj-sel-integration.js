/**
 * PromptDJ SEL Integration
 * Enhances PromptDJ with SEL-specific functionality
 */

class PromptDJSELIntegration {
    constructor() {
        this.currentActivity = null;
        this.activityPrompts = {
            mindfulness: [
                'Calm Meditation',
                'Peaceful Breathing', 
                'Gentle Nature Sounds',
                'Tranquil Ambient',
                'Mindful Awareness',
                'Centered Presence'
            ],
            emotion: [
                'Joyful Celebration',
                'Peaceful Contentment',
                'Melancholic Reflection',
                'Energetic Excitement',
                'Calm Serenity',
                'Gentle Understanding'
            ],
            relaxation: [
                'Soft Lullaby',
                'Gentle Waves',
                'Peaceful Forest',
                'Calm Breathing',
                'Soothing Comfort',
                'Tranquil Rest'
            ],
            group: [
                'Collaborative Rhythm',
                'Group Harmony',
                'Interactive Beats',
                'Community Celebration',
                'Shared Connection',
                'Collective Energy'
            ]
        };
        
        this.init();
    }
    
    init() {
        // Check if we're in PromptDJ context
        if (window.location.pathname.includes('promptdj-midi')) {
            this.setupSELIntegration();
        }
    }
    
    setupSELIntegration() {
        // Add SEL activity selector
        this.createActivitySelector();
        
        // Check for stored activity from dashboard
        this.loadStoredActivity();
        
        // Add SEL guidance overlay
        this.createGuidanceOverlay();
    }
    
    createActivitySelector() {
        const selector = document.createElement('div');
        selector.id = 'sel-activity-selector';
        selector.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(15, 44, 77, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            font-family: 'Atkinson Hyperlegible', sans-serif;
            min-width: 200px;
        `;
        
        selector.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #73bdf5;">SEL Activity</h3>
            <select id="activity-select" style="width: 100%; padding: 5px; border-radius: 4px; border: none; margin-bottom: 10px;">
                <option value="">Choose Activity...</option>
                <option value="mindfulness">🧘 Mindfulness</option>
                <option value="emotion">😊 Emotion Expression</option>
                <option value="relaxation">😌 Relaxation</option>
                <option value="group">👥 Group Activity</option>
            </select>
            <button id="apply-prompts" style="width: 100%; padding: 8px; background: #73bdf5; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Apply SEL Prompts
            </button>
        `;
        
        document.body.appendChild(selector);
        
        // Add event listeners
        document.getElementById('apply-prompts').addEventListener('click', () => {
            this.applySELPrompts();
        });
    }
    
    createGuidanceOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'sel-guidance';
        overlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(15, 44, 77, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 1000;
            font-family: 'Atkinson Hyperlegible', sans-serif;
            max-width: 300px;
            display: none;
        `;
        
        overlay.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #73bdf5;">SEL Music Tips</h4>
            <div id="guidance-content">
                <p style="margin: 0; font-size: 12px; line-height: 1.4;">
                    Choose an SEL activity above to get specific prompts and guidance for your classroom music session.
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    loadStoredActivity() {
        try {
            const storedActivity = localStorage.getItem('selMusicActivity');
            if (storedActivity) {
                const activity = JSON.parse(storedActivity);
                this.currentActivity = activity;
                this.updateGuidance(activity);
                document.getElementById('sel-guidance').style.display = 'block';
                
                // Clear stored activity after loading
                localStorage.removeItem('selMusicActivity');
            }
        } catch (error) {
            console.log('No stored SEL activity found');
        }
    }
    
    applySELPrompts() {
        const activityType = document.getElementById('activity-select').value;
        if (!activityType) {
            alert('Please select an SEL activity first.');
            return;
        }
        
        const prompts = this.activityPrompts[activityType];
        if (prompts) {
            // This would need to be integrated with the actual PromptDJ component
            // For now, we'll show the prompts and provide guidance
            this.showPromptsForActivity(activityType, prompts);
        }
    }
    
    showPromptsForActivity(activityType, prompts) {
        const guidance = document.getElementById('guidance-content');
        const activityNames = {
            mindfulness: 'Mindfulness Session',
            emotion: 'Emotion Expression',
            relaxation: 'Relaxation Exercise',
            group: 'Group Activity'
        };
        
        guidance.innerHTML = `
            <h5 style="margin: 0 0 8px 0; color: #73bdf5;">${activityNames[activityType]}</h5>
            <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.4;">
                Suggested prompts for this activity:
            </p>
            <ul style="margin: 0; padding-left: 15px; font-size: 11px;">
                ${prompts.map(prompt => `<li>${prompt}</li>`).join('')}
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #73bdf5;">
                💡 Tip: Start with lower volume and gradually adjust based on student engagement.
            </p>
        `;
        
        document.getElementById('sel-guidance').style.display = 'block';
    }
    
    updateGuidance(activity) {
        const guidance = document.getElementById('guidance-content');
        guidance.innerHTML = `
            <h5 style="margin: 0 0 8px 0; color: #73bdf5;">${activity.title}</h5>
            <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.4;">
                ${activity.description}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #73bdf5;">
                Suggested prompts:
            </p>
            <ul style="margin: 0; padding-left: 15px; font-size: 11px;">
                ${activity.prompts.map(prompt => `<li>${prompt}</li>`).join('')}
            </ul>
        `;
    }
}

// Initialize SEL integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptDJSELIntegration();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptDJSELIntegration;
} 