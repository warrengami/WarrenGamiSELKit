// File: dashboard.js
// Logic for making the Teacher Dashboard interactive.

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the unified data processor
    const dataProcessor = new SELDataProcessor();

    // --- SEARCH AND FILTER FUNCTIONALITY ---
    const searchInput = document.getElementById('resource-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const listItems = document.querySelectorAll('#printable-list li:not(#no-results-message)');
    const noResultsMessage = document.getElementById('no-results-message');

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
        clearSearchBtn.style.display = query ? 'block' : 'none';
    }

    if (searchInput) searchInput.addEventListener('input', filterResources);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterResources();
    });

    // --- NEW SEL DATA HUB LOGIC ---
    const inputReflectionBtn = document.getElementById('input-reflection-btn');
    const viewSelBtn = document.getElementById('view-sel-data');
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    const modal = document.getElementById('reflection-modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const saveReflectionBtn = document.getElementById('save-reflection-btn');
    const pasteArea = document.getElementById('reflection-paste-area');
    const modalStatus = document.getElementById('modal-status');

    if (inputReflectionBtn) {
        inputReflectionBtn.onclick = () => {
            modal.classList.add('is-visible');
            pasteArea.value = '';
            modalStatus.textContent = '';
            pasteArea.focus();
        };
    }

    if (closeModalBtn) closeModalBtn.onclick = () => { modal.classList.remove('is-visible'); };
    window.onclick = (event) => { if (event.target === modal) modal.classList.remove('is-visible'); };

    if (viewSelBtn) {
        viewSelBtn.onclick = function() { window.open('sel-data.html', '_blank'); };
    }

    if (viewPortfolioBtn) {
        viewPortfolioBtn.onclick = function() { window.open('student-portfolio.html', '_blank'); };
    }

    // Process and save reflections using the unified processor
    function processAndSaveReflections(text) {
        try {
            const results = dataProcessor.processMultiStudentInput(text);
            
            if (results.processedEntries.length > 0) {
                // Validate all entries before saving
                const validEntries = [];
                results.processedEntries.forEach(entry => {
                    const validation = dataProcessor.validateEntry(entry);
                    if (validation.isValid) {
                        validEntries.push(entry);
                    } else {
                        console.warn('Invalid entry:', validation.errors);
                    }
                });

                if (validEntries.length > 0) {
                    dataProcessor.saveEntries(validEntries);
                    const message = `✅ Saved ${validEntries.length} student reflection${validEntries.length > 1 ? 's' : ''}.`;
                    if (results.errorCount > 0) {
                        return { 
                            success: true, 
                            message: `${message} ${results.errorCount} failed to parse.` 
                        };
                    }
                    return { success: true, message };
                }
            }
            
            return { 
                success: false, 
                message: `❌ Failed to parse any student reflections. Errors: ${results.errors.join('; ')}` 
            };

        } catch (error) {
            console.error('Processing error:', error);
            return { success: false, message: `Processing Error: ${error.message}` };
        }
    }

    if (saveReflectionBtn) {
        saveReflectionBtn.onclick = () => {
            const result = processAndSaveReflections(pasteArea.value);
            modalStatus.textContent = result.message;
            if (result.success) {
                pasteArea.value = '';
                setTimeout(() => { modal.classList.remove('is-visible'); }, 2000);
            }
        };
    }
});
