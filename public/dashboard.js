// File: dashboard.js
// Logic for making the Teacher Dashboard interactive.

document.addEventListener('DOMContentLoaded', () => {
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
    const modal = document.getElementById('reflection-modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const saveReflectionBtn = document.getElementById('save-reflection-btn');
    const pasteArea = document.getElementById('reflection-paste-area');
    const modalStatus = document.getElementById('modal-status');

    if (inputReflectionBtn) {
        inputReflectionBtn.onclick = () => {
            modal.style.display = 'flex';
            pasteArea.value = '';
            modalStatus.textContent = '';
            pasteArea.focus();
        };
    }

    if (closeModalBtn) closeModalBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; };

    if (viewSelBtn) {
        viewSelBtn.onclick = function() { window.open('sel-data.html', '_blank'); };
    }

    function parseAndSaveReflection(text) {
        try {
            const entry = {};

            const extractValue = (key, multiline = false) => {
                const cleanKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = multiline
                    ? new RegExp(`^${cleanKey}\\s*$\\n(.*?)(?=\\n^\\S|\\n\\n|$)`, 'ms')
                    : new RegExp(`^${cleanKey}:\\s*(.*)`, 'm');
                const match = text.match(regex);
                return match ? match[1].trim() : 'N/A';
            };
            
            const extractRating = (skillName, ratingType) => {
                const cleanSkill = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`^${cleanSkill}:\\n\\s*-\\s*${ratingType} Rating:\\s*(\\d+)\\s*/\\s*5`, 'm');
                const match = text.match(regex);
                return match ? match[1] : '0';
            };

            entry.name = extractValue('Student');
            entry.date = extractValue('Date');

            if (entry.name === 'N/A' || !entry.name) throw new Error("Could not parse Student Name.");
            if (entry.date === 'N/A' || !entry.date) throw new Error("Could not parse Date.");

            entry.namingEmotions_B = extractRating('Naming my emotions', 'Beginning');
            entry.namingEmotions_N = extractRating('Naming my emotions', 'Current');
            entry.calming_B = extractRating('Calming myself down', 'Beginning');
            entry.calming_N = extractRating('Calming myself down', 'Current');
            entry.understandingOthers_B = extractRating("Understanding others' feelings", 'Beginning');
            entry.understandingOthers_N = extractRating("Understanding others' feelings", 'Current');
            entry.solvingConflicts_B = extractRating('Solving conflicts peacefully', 'Beginning');
            entry.solvingConflicts_N = extractRating('Solving conflicts peacefully', 'Current');
            entry.growthScore = extractValue('Total Growth Score');
            entry.proudestImprovement = extractValue("Skill I'm most proud of improving", true);
            entry.successStory = extractValue("A time I successfully used a skill", true);
            entry.nextGoal = extractValue("SEL skill to focus on", true);
            entry.goalStrategy = extractValue("One way I can practice this is by", true);

            const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
            data.push(entry);
            localStorage.setItem('selToolkit-selData', JSON.stringify(data));
            
            return { success: true, message: `✅ Saved entry for ${entry.name}.` };

        } catch (error) {
            return { success: false, message: `Parse Error: ${error.message}` };
        }
    }

    if (saveReflectionBtn) {
        saveReflectionBtn.onclick = () => {
            const text = pasteArea.value;
            if (!text.trim()) {
                modalStatus.textContent = 'Please paste text into the box.';
                modalStatus.style.color = '#c0392b';
                return;
            }
            const result = parseAndSaveReflection(text);
            modalStatus.textContent = result.message;
            modalStatus.style.color = result.success ? '#27ae60' : '#c0392b';
            if (result.success) {
                pasteArea.value = '';
                setTimeout(() => { modal.style.display = 'none'; }, 2000);
            }
        };
    }
});
