// File: dashboard.js
// Teacher Dashboard functionality - Focused on Dice and Scenario Cards

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded - Dice and Scenario Cards focus');
    
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

    // Search functionality for printables
    if (resourceSearch) {
        resourceSearch.addEventListener('input', () => {
            const searchTerm = resourceSearch.value.toLowerCase();
            const items = printableList.querySelectorAll('li[data-type]');
            let visibleCount = 0;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
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
        });
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            resourceSearch.value = '';
            resourceSearch.dispatchEvent(new Event('input'));
            clearSearch.style.display = 'none';
        });
    }

    // User info display
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const currentUser = localStorage.getItem('currentUser') || 'Teacher';
        userInfo.innerHTML = `<p>Welcome, ${currentUser}!</p>`;
    }

    console.log('Dashboard initialization complete');
});
