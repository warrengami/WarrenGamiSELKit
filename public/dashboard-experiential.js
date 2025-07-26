// File: dashboard-experiential.js
// Experiential Dashboard functionality - No data collection

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 Experiential Dashboard Initialized');
    
    // Initialize experiential systems
    initializeExperientialSystems();
    
    // Get DOM elements
    const resourceSearch = document.getElementById('resource-search');
    const clearSearch = document.getElementById('clear-search');
    const printableList = document.getElementById('printable-list');
    const noResultsMessage = document.getElementById('no-results-message');

    // Classroom mode function
    function openClassroom(type, file) {
        try {
            const url = `classroom.html?type=${encodeURIComponent(type)}&file=${encodeURIComponent(file)}`;
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                alert('Please allow pop-ups for this site to use classroom mode.');
            }
        } catch (error) {
            console.error('Error opening classroom mode:', error);
            alert('Error opening classroom mode. Please try again.');
        }
    }

    // Make openClassroom available globally
    window.openClassroom = openClassroom;

    // Initialize experiential systems
    function initializeExperientialSystems() {
        // Initialize experiential core if available
        if (window.ExperientialSEL) {
            console.log('✅ Experiential SEL Core loaded');
            
            // Setup event listeners
            window.ExperientialSEL.on('experience:start', (data) => {
                console.log('🎯 Experience started:', data.type);
                showNotification(`Started ${data.type} experience`, 'success');
            });
            
            window.ExperientialSEL.on('experience:end', (data) => {
                console.log('✅ Experience completed:', data.experienceId);
                showNotification(`Completed ${data.type} experience`, 'info');
            });
            
            window.ExperientialSEL.on('heartbeat', (data) => {
                // Real-time system heartbeat
                console.log('💓 System heartbeat:', data.state);
            });
        }

        // Initialize mood and energy tracker if available
        if (window.MoodEnergyTracker) {
            console.log('✅ Mood & Energy Tracker loaded');
            
            window.MoodEnergyTracker.on('mood:change', (data) => {
                console.log('😊 Mood changed:', data.current);
                showNotification(`Mood updated to ${data.current}`, 'success');
            });
            
            window.MoodEnergyTracker.on('energy:change', (data) => {
                console.log('⚡ Energy changed:', data.current);
                showNotification(`Energy updated to ${data.current}`, 'success');
            });
        }

        // Initialize real-time reflection if available
        if (window.RealTimeReflection) {
            console.log('✅ Real-Time Reflection loaded');
            
            window.RealTimeReflection.on('reflection:start', (data) => {
                console.log('🧘 Reflection started:', data.type);
                showNotification(`Started ${data.type} reflection`, 'success');
            });
            
            window.RealTimeReflection.on('reflection:end', (data) => {
                console.log('✅ Reflection completed with', data.responseCount, 'responses');
                showNotification(`Reflection completed with ${data.responseCount} responses`, 'info');
            });
        }

        // Initialize experiential classroom if available
        if (window.ExperientialClassroom) {
            console.log('✅ Experiential Classroom loaded');
            
            window.ExperientialClassroom.on('classroom:session:start', (data) => {
                console.log('🚀 Classroom session started:', data.sessionId);
                showNotification('Classroom session started', 'success');
            });
            
            window.ExperientialClassroom.on('classroom:session:end', (data) => {
                console.log('✅ Classroom session ended:', data.sessionId);
                showNotification('Classroom session ended', 'info');
            });
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#333';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Resource search functionality
    if (resourceSearch && clearSearch && printableList) {
        resourceSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const listItems = printableList.querySelectorAll('li[data-type]');
            let visibleCount = 0;

            listItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Show/hide no results message
            if (noResultsMessage) {
                noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            // Show/hide clear button
            clearSearch.style.display = searchTerm ? 'block' : 'none';
        });

        clearSearch.addEventListener('click', function() {
            resourceSearch.value = '';
            resourceSearch.dispatchEvent(new Event('input'));
            this.style.display = 'none';
        });
    }

    // Quick start functions
    window.startQuickReflection = function() {
        if (window.RealTimeReflection) {
            const sessionId = window.RealTimeReflection.startReflection('immediate');
            showNotification('Started immediate reflection', 'success');
        }
    };

    window.startQuickDiscussion = function() {
        if (window.ExperientialClassroom) {
            window.ExperientialClassroom.startSession({ type: 'discussion' });
            window.ExperientialClassroom.startThinkPairShare({ topic: 'Quick SEL Discussion' });
            showNotification('Started Think-Pair-Share discussion', 'success');
        }
    };

    window.startQuickMoodCheck = function() {
        if (window.MoodEnergyTracker) {
            // Trigger a quick mood check
            const moods = ['happy', 'calm', 'excited', 'neutral'];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            window.MoodEnergyTracker.updateMood(randomMood);
            showNotification(`Quick mood check: ${randomMood}`, 'success');
        }
    };

    // System status functions
    window.getSystemStatus = function() {
        const status = {
            experiential: window.ExperientialSEL ? window.ExperientialSEL.getStatistics() : null,
            mood: window.MoodEnergyTracker ? window.MoodEnergyTracker.getStatistics() : null,
            reflection: window.RealTimeReflection ? window.RealTimeReflection.getStatistics() : null,
            classroom: window.ExperientialClassroom ? window.ExperientialClassroom.getStatistics() : null
        };
        
        console.log('System Status:', status);
        showNotification('System status logged to console', 'info');
        return status;
    };

    window.getCurrentState = function() {
        const state = {
            experiential: window.ExperientialSEL ? window.ExperientialSEL.getState() : null,
            mood: window.MoodEnergyTracker ? window.MoodEnergyTracker.getCurrentState() : null,
            classroom: window.ExperientialClassroom ? window.ExperientialClassroom.getCurrentState() : null
        };
        
        console.log('Current State:', state);
        showNotification('Current state logged to console', 'info');
        return state;
    };

    // Cleanup function
    window.cleanupSystem = function() {
        if (window.ExperientialSEL) {
            window.ExperientialSEL.cleanup();
        }
        showNotification('System cleanup completed', 'success');
    };

    // Reset function
    window.resetSystem = function() {
        if (confirm('Are you sure you want to reset the system? This will clear all current sessions.')) {
            location.reload();
        }
    };

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click effects to resource links
    const resourceLinks = document.querySelectorAll('.resource-list a');
    resourceLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add a subtle click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    console.log('🌊 Experiential Dashboard setup complete');
}); 