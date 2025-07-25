// File: dashboard.js
// Teacher Dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the unified data processor
    const dataProcessor = new SELDataProcessor();
    
    // Get DOM elements
    const inputReflectionBtn = document.getElementById('input-reflection-btn');
    const viewSelDataBtn = document.getElementById('view-sel-data');
    const viewPortfolioBtn = document.getElementById('view-portfolio');
    const reflectionModal = document.getElementById('reflection-modal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const saveReflectionBtn = document.getElementById('save-reflection-btn');
    const reflectionPasteArea = document.getElementById('reflection-paste-area');
    const modalStatus = document.getElementById('modal-status');
    const resourceSearch = document.getElementById('resource-search');
    const clearSearch = document.getElementById('clear-search');
    const printableList = document.getElementById('printable-list');
    const noResultsMessage = document.getElementById('no-results-message');

    // Classroom mode function
    function openClassroom(type, file) {
        const url = `classroom.html?type=${type}&file=${file}`;
        window.open(url, '_blank');
    }

    // Make openClassroom available globally
    window.openClassroom = openClassroom;

    // Process and save reflections
    function processAndSaveReflections() {
        const text = reflectionPasteArea.value.trim();
        if (!text) {
            modalStatus.textContent = 'Please paste some reflection data.';
            modalStatus.style.color = '#dc3545';
            return;
        }

        try {
            // Initialize the unified data processor
            const dataProcessor = new SELDataProcessor();

            // Process the multi-student input
            const results = dataProcessor.processMultiStudentInput(text);

            if (results.success) {
                modalStatus.textContent = `Successfully processed ${results.processedCount} student reflection(s)!`;
                modalStatus.style.color = '#28a745';
                reflectionPasteArea.value = '';
                
                // Close modal after a short delay
                setTimeout(() => {
                    reflectionModal.style.display = 'none';
                    modalStatus.textContent = '';
                }, 2000);
            } else {
                modalStatus.textContent = `Error: ${results.error}`;
                modalStatus.style.color = '#dc3545';
            }
        } catch (error) {
            console.error('Error processing reflections:', error);
            modalStatus.textContent = 'An error occurred while processing the reflections.';
            modalStatus.style.color = '#dc3545';
        }
    }

    // Event listeners
    inputReflectionBtn.addEventListener('click', () => {
        reflectionModal.style.display = 'flex';
        reflectionPasteArea.focus();
    });

    modalCloseBtn.addEventListener('click', () => {
        reflectionModal.style.display = 'none';
        modalStatus.textContent = '';
    });

    saveReflectionBtn.addEventListener('click', processAndSaveReflections);

    // Close modal when clicking outside
    reflectionModal.addEventListener('click', (e) => {
        if (e.target === reflectionModal) {
            reflectionModal.style.display = 'none';
            modalStatus.textContent = '';
        }
    });

    // Navigation buttons
    viewSelDataBtn.addEventListener('click', () => {
        window.open('sel-data.html', '_blank');
    });

    viewPortfolioBtn.addEventListener('click', () => {
        window.open('student-portfolio-enhanced.html', '_blank');
    });

    // Search functionality
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
        clearSearch.style.display = searchTerm ? 'block' : 'none';
        
        // Show/hide no results message
        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    });

    clearSearch.addEventListener('click', () => {
        resourceSearch.value = '';
        resourceSearch.dispatchEvent(new Event('input'));
        clearSearch.style.display = 'none';
    });

    // User info display
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        const currentUser = localStorage.getItem('currentUser') || 'Teacher';
        userInfo.innerHTML = `<p>Welcome, ${currentUser}!</p>`;
    }
});
