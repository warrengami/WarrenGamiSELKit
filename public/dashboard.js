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
    
    function addActionButtons() {
        listItems.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;
            
            const resourceType = item.dataset.type;
            
            // Add Project Button if projectable
            if (resourceType) {
                const href = link.getAttribute('href');
                // CHANGED: Create a <button> instead of an <a>
                const projectButton = document.createElement('button');
                projectButton.className = 'project-btn';
                projectButton.setAttribute('aria-label', 'Project this resource');
                
                // Set the onclick action to open the classroom hub in a new tab
                const classroomUrl = `classroom.html?type=${resourceType}&file=${encodeURIComponent(href)}`;
                projectButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(classroomUrl, '_blank');
                };
                
                projectButton.innerHTML = `<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzBmMmM0ZCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDRINHYxMmgxNlY0em0wIDE0SDRWNWgtMnYxNGMwIDEuMS45IDIgMiAyaDE0VjE4em0tMTAuNS04NUw4IDdoMi41VjUuNWgxVjdMOEw5LjUgOC41eiIvPjwvc3ZnPg==" class="icon" alt="Projector icon">`;
                link.appendChild(projectButton);
            }

            // Add Favorite Button
            const favButton = document.createElement('button');
            favButton.className = 'favorite-btn';
            favButton.textContent = '☆';
            favButton.setAttribute('aria-label', 'Toggle Favorite');
            favButton.setAttribute('aria-pressed', 'false');
            link.appendChild(favButton);
        });
    }
    
    // --- INITIALIZATION ---
    addActionButtons();
    updateOriginalFavoriteState();
    updateFavoritesList();

    // Attach delegated listeners to the persistent containers
    printableList.addEventListener('click', e => {
        const targetButton = e.target.closest('.favorite-btn, .project-btn');
        if (!targetButton) return;
        
        if (targetButton.classList.contains('favorite-btn')) {
            toggleFavorite(e);
        }
    });
    favoritesContainer.addEventListener('click', e => {
        const targetButton = e.target.closest('.favorite-btn, .project-btn');
         if (!targetButton) return;

        if (targetButton.classList.contains('favorite-btn')) {
            toggleFavorite(e);
        } else if (targetButton.classList.contains('project-btn')) {
            // Since this is a clone, we handle its click directly
            e.preventDefault();
            e.stopPropagation();
            const link = targetButton.closest('a');
            const href = link.getAttribute('href');
            const resourceType = link.parentElement.dataset.type;
            const classroomUrl = `classroom.html?type=${resourceType}&file=${encodeURIComponent(href)}`;
            window.open(classroomUrl, '_blank');
        }
    });

    // --- SEARCH AND FILTER FUNCTIONALITY ---
    function filterResources() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        clearSearchBtn.style.display = query ? 'block' : 'none';

        listItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const tags = Array.from(item.querySelectorAll('.sel-tag')).map(tag => tag.dataset.tag.toLowerCase());
            const matchesQuery = text.includes(query) || tags.some(tag => tag.includes(query));

            if (matchesQuery) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
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
});
