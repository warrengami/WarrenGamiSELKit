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
