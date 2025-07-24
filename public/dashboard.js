// File: dashboard.js
// Logic for making the Teacher Dashboard interactive.

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('resource-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const printableList = document.getElementById('printable-list');
    const listItems = printableList.querySelectorAll('li:not(#no-results-message)');
    const noResultsMessage = document.getElementById('no-results-message');
    const selTags = document.querySelectorAll('.sel-tag');

    // --- FAVORITES FUNCTIONALITY REMOVED ---

    // --- SEARCH AND FILTER FUNCTIONALITY ---
    function filterResources() {
        let visibleCount = 0;
        const query = searchInput.value.trim().toLowerCase();
        listItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const match = text.includes(query);
            item.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });
        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    searchInput.addEventListener('input', filterResources);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterResources();
    });
    selTags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.dataset.tag;
            filterResources();
            searchInput.focus();
        });
        tag.setAttribute('tabindex', '0');
        tag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                searchInput.value = tag.dataset.tag;
                filterResources();
                searchInput.focus();
            }
        });
    });

    // SEL Data Collection buttons
    const startSelBtn = document.getElementById('start-sel-data');
    const viewSelBtn = document.getElementById('view-sel-data');
    if (startSelBtn) {
        startSelBtn.onclick = function() {
            window.open('self-assessment.html', '_blank');
        };
    }
    if (viewSelBtn) {
        viewSelBtn.onclick = function() {
            window.open('sel-data.html', '_blank');
        };
    }
});
