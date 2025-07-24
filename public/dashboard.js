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

    // SEL Data Hub Setup logic
    const gformInput = document.getElementById('gform-link-input');
    const saveBtn = document.getElementById('save-gform-link');
    const statusSpan = document.getElementById('link-save-status');
    if (gformInput && saveBtn && statusSpan) {
        // Load saved link if present
        const savedLink = localStorage.getItem('selToolkit-gformLink');
        if (savedLink) gformInput.value = savedLink;
        saveBtn.onclick = function() {
            const link = gformInput.value.trim();
            if (!link || !/^https:\/\//.test(link)) {
                statusSpan.textContent = 'Please enter a valid Google Form pre-filled link.';
                statusSpan.style.color = '#e74c3c';
                return;
            }
            localStorage.setItem('selToolkit-gformLink', link);
            statusSpan.textContent = 'Link saved! Data Hub is now active.';
            statusSpan.style.color = '#27ae60';
            setTimeout(()=>{statusSpan.textContent='';}, 3000);
        };
    }
});
