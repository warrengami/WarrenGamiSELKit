// File: dashboard.js
// Logic for making the Teacher Dashboard interactive.

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('resource-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const printableList = document.getElementById('printable-list');
    const listItems = printableList.querySelectorAll('li:not(#no-results-message)');
    const noResultsMessage = document.getElementById('no-results-message');
    const selTags = document.querySelectorAll('.sel-tag');

    // --- FAVORITES FUNCTIONALITY ---
    const favorites = new Set(JSON.parse(localStorage.getItem('selToolkitFavorites')) || []);
    const favoritesContainer = document.createElement('div');
    favoritesContainer.id = 'favorites-container';
    printableList.parentNode.insertBefore(favoritesContainer, printableList);
    
    function updateFavoritesList() {
        if (favorites.size === 0) {
            favoritesContainer.innerHTML = '';
            return;
        }
        favoritesContainer.innerHTML = '<h3 class="resource-group-title">My Favorites ★</h3><ul class="resource-list" id="favorites-list"></ul>';
        const favoritesList = document.getElementById('favorites-list');

        listItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && favorites.has(link.getAttribute('href'))) {
                const clone = item.cloneNode(true);
                const favButton = clone.querySelector('.favorite-btn');
                if (favButton) {
                    favButton.textContent = '★';
                    favButton.classList.add('is-favorite');
                    favButton.setAttribute('aria-pressed', 'true');
                }
                favoritesList.appendChild(clone);
            }
        });
    }

    function toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        const button = e.currentTarget;
        const link = button.closest('a');
        const href = link.getAttribute('href');

        if (favorites.has(href)) {
            favorites.delete(href);
        } else {
            favorites.add(href);
        }
        localStorage.setItem('selToolkitFavorites', JSON.stringify(Array.from(favorites)));
        updateOriginalFavoriteState();
        updateFavoritesList();
    }

    function updateOriginalFavoriteState() {
         listItems.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;
            const favButton = item.querySelector('.favorite-btn');
            const href = link.getAttribute('href');
            if (favorites.has(href)) {
                favButton.textContent = '★';
                favButton.classList.add('is-favorite');
                favButton.setAttribute('aria-pressed', 'true');
            } else {
                favButton.textContent = '☆';
                favButton.classList.remove('is-favorite');
                favButton.setAttribute('aria-pressed', 'false');
            }
        });
    }
    
    // Attach delegated listeners to the persistent containers
    printableList.addEventListener('click', e => {
        const targetButton = e.target.closest('.favorite-btn');
        if (!targetButton) return;
        
        if (targetButton.classList.contains('favorite-btn')) {
            toggleFavorite(e);
        }
    });
    favoritesContainer.addEventListener('click', e => {
        const targetButton = e.target.closest('.favorite-btn');
        if (!targetButton) return;

        if (targetButton.classList.contains('favorite-btn')) {
            toggleFavorite(e);
        }
    });

    // --- SEARCH AND FILTER FUNCTIONALITY ---
    function filterResources() {
        });

        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        updateFavoritesList();
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
            alert('Start Collecting SEL Data button clicked');
            window.open('self-assessment.html', '_blank');
        };
    }
    if (viewSelBtn) {
        viewSelBtn.onclick = function() {
            alert('View/Export SEL Data button clicked');
            window.open('sel-data.html', '_blank');
        };
    }
});
