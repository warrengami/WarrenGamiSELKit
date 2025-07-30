// File: dashboard.js
// Teacher Dashboard functionality - Enhanced with advanced search and filtering

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded - Enhanced search and filtering');
    
    // Get DOM elements
    const resourceSearch = document.getElementById('resource-search');
    const clearSearch = document.getElementById('clear-search');
    const printableList = document.getElementById('printable-list');
    const noResultsMessage = document.getElementById('no-results-message');

    // Classroom mode function for dice and scenario cards
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

    // Enhanced search functionality with multiple filters
    function performSearch() {
        const searchTerm = resourceSearch.value.toLowerCase();
        const items = printableList.querySelectorAll('li[data-type]');
        let visibleCount = 0;

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const tags = item.querySelectorAll('.sel-tag');
            let matchesSearch = text.includes(searchTerm);
            let matchesCompetency = true;
            let matchesType = true;

            // Check if any SEL competency tags match the search
            if (searchTerm && tags.length > 0) {
                const tagTexts = Array.from(tags).map(tag => tag.textContent.toLowerCase());
                matchesSearch = matchesSearch || tagTexts.some(tag => tag.includes(searchTerm));
            }

            // Additional filtering logic can be added here
            // For example, filtering by activity type or grade level

            if (matchesSearch && matchesCompetency && matchesType) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Show/hide clear button
        if (clearSearch) {
            clearSearch.style.display = searchTerm ? 'block' : 'none';
        }
        
        // Show/hide no results message
        if (noResultsMessage) {
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Update search results count
        updateSearchResultsCount(visibleCount, items.length);
    }

    // Update search results count display
    function updateSearchResultsCount(visible, total) {
        const resultsCount = document.getElementById('search-results-count');
        if (resultsCount) {
            if (visible === total) {
                resultsCount.textContent = `Showing all ${total} resources`;
            } else {
                resultsCount.textContent = `Showing ${visible} of ${total} resources`;
            }
        }
    }

    // Search functionality for printables
    if (resourceSearch) {
        resourceSearch.addEventListener('input', performSearch);
        
        // Add placeholder text with search tips
        resourceSearch.placeholder = 'Search by name, SEL competency, or activity type...';
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            resourceSearch.value = '';
            performSearch();
            clearSearch.style.display = 'none';
        });
    }

    // Add quick filter buttons for common searches
    function addQuickFilters() {
        const filterContainer = document.createElement('div');
        filterContainer.style.cssText = 'margin: 10px 0; display: flex; gap: 8px; flex-wrap: wrap;';
        
        const filters = [
            { text: '🎲 Dice', search: 'dice' },
            { text: '📄 Cards', search: 'scenario' },
            { text: '😊 Emotions', search: 'emotions' },
            { text: '🤝 Social Skills', search: 'social' },
            { text: '🧠 Self-Awareness', search: 'self-awareness' },
            { text: '⚡ Quick Activities', search: 'quick' }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.textContent = filter.text;
            button.style.cssText = `
                background: var(--ice-blue);
                border: 1px solid var(--sky-blue);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8em;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => {
                resourceSearch.value = filter.search;
                performSearch();
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.background = 'var(--sky-blue)';
                button.style.color = 'white';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'var(--ice-blue)';
                button.style.color = 'var(--midnight-blue)';
            });
            
            filterContainer.appendChild(button);
        });

        // Insert after the search bar
        if (resourceSearch && resourceSearch.parentElement) {
            resourceSearch.parentElement.parentElement.appendChild(filterContainer);
        }
    }

    // Initialize quick filters
    addQuickFilters();

    // User info display
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const currentUser = localStorage.getItem('currentUser') || 'Teacher';
        userInfo.innerHTML = `<p>Welcome, ${currentUser}!</p>`;
    }

    // Timer duration setting functionality
    function setTimerDuration(seconds) {
        localStorage.setItem('timerDuration', seconds);
        const currentTimer = document.getElementById('current-timer');
        if (currentTimer) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const displayText = minutes > 0 ? 
                `${minutes} minute${minutes > 1 ? 's' : ''}` : 
                `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
            currentTimer.textContent = displayText;
        }
    }

    // Make setTimerDuration available globally
    window.setTimerDuration = setTimerDuration;

    console.log('Enhanced dashboard initialization complete');
});

// Enhanced functionality for the new visual features

// Progress tracking functionality
function updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
}

// Enhanced filter functionality with emotion-based filtering
function filterByEmotion(emotion) {
    const resourceLinks = document.querySelectorAll('.resource-list a');
    resourceLinks.forEach(link => {
        const tags = link.querySelectorAll('.sel-tag');
        let shouldShow = false;
        
        tags.forEach(tag => {
            if (emotion === 'all' || tag.classList.contains(emotion)) {
                shouldShow = true;
            }
        });
        
        link.style.display = shouldShow ? 'flex' : 'none';
    });
}

// Animated progress bar initialization
function initProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        // Animate progress bar on page load
        setTimeout(() => {
            progressFill.style.width = '75%';
        }, 1000);
    }
}

// Enhanced floating action button functionality
function initFloatingActionButton() {
    const fab = document.querySelector('.fab');
    const fabMenu = document.getElementById('fabMenu');
    
    if (fab && fabMenu) {
        // Add hover effects
        fab.addEventListener('mouseenter', () => {
            fab.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        fab.addEventListener('mouseleave', () => {
            fab.style.transform = 'scale(1) rotate(0deg)';
        });
    }
}

// Quick filter functionality with enhanced UI
function initQuickFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Apply filter
            const filterType = e.target.getAttribute('onclick').match(/filterByType\('([^']+)'\)/)[1];
            applyQuickFilter(filterType);
        });
    });
}

function applyQuickFilter(type) {
    const resourceLinks = document.querySelectorAll('.resource-list a');
    let visibleCount = 0;
    
    resourceLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        const tags = link.querySelectorAll('.sel-tag');
        let shouldShow = false;
        
        switch(type) {
            case 'dice':
                shouldShow = text.includes('dice');
                break;
            case 'cards':
                shouldShow = text.includes('card') || text.includes('scenario');
                break;
            case 'emotions':
                shouldShow = text.includes('emotion') || text.includes('feeling');
                break;
            case 'social':
                shouldShow = text.includes('social') || text.includes('empathy') || text.includes('kindness');
                break;
            case 'quick':
                shouldShow = text.includes('quick') || text.includes('simple');
                break;
            case 'all':
            default:
                shouldShow = true;
                break;
        }
        
        link.style.display = shouldShow ? 'flex' : 'none';
        if (shouldShow) visibleCount++;
    });
    
    // Update results count
    updateSearchResultsCount(visibleCount, resourceLinks.length);
}

// Enhanced search with emotion-based color coding
function performEnhancedSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const resourceLinks = document.querySelectorAll('.resource-list a');
    let visibleCount = 0;

    resourceLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        const tags = link.querySelectorAll('.sel-tag');
        let isVisible = text.includes(searchTerm);
        
        // Also search in SEL tags
        tags.forEach(tag => {
            if (tag.textContent.toLowerCase().includes(searchTerm)) {
                isVisible = true;
            }
        });
        
        link.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) visibleCount++;
    });

    // Show/hide no results message
    const noResultsMessage = document.getElementById('no-results-message');
    if (noResultsMessage) {
        noResultsMessage.style.display = visibleCount === 0 && searchTerm.length > 0 ? 'block' : 'none';
    }

    // Show/hide clear button
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchTerm.length > 0 ? 'flex' : 'none';
    }
    
    updateSearchResultsCount(visibleCount, resourceLinks.length);
}

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initFloatingActionButton();
    initQuickFilters();
    
    // Enhanced search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', performEnhancedSearch);
    }
    
    // Clear search functionality
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
                performEnhancedSearch();
            }
        });
    }
    
    // FAB menu toggle
    window.toggleFabMenu = function() {
        const fabMenu = document.getElementById('fabMenu');
        if (fabMenu) {
            fabMenu.classList.toggle('show');
        }
    };
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', function(event) {
        const fabContainer = document.querySelector('.fab-container');
        const fabMenu = document.getElementById('fabMenu');
        
        if (fabContainer && fabMenu && !fabContainer.contains(event.target)) {
            fabMenu.classList.remove('show');
        }
    });
});

// Enhanced accessibility features
function enhanceAccessibility() {
    // Add keyboard navigation for floating action button
    const fab = document.querySelector('.fab');
    if (fab) {
        fab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFabMenu();
            }
        });
    }
    
    // Add ARIA labels for better screen reader support
    const resourceLinks = document.querySelectorAll('.resource-list a');
    resourceLinks.forEach(link => {
        const text = link.querySelector('.link-text').textContent;
        const tags = link.querySelectorAll('.sel-tag');
        const tagTexts = Array.from(tags).map(tag => tag.textContent).join(', ');
        link.setAttribute('aria-label', `${text}. SEL competencies: ${tagTexts}`);
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', enhanceAccessibility);
