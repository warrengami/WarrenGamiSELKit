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

    function parseAndSaveReflection(text) {
        try {
            const entry = {};

            // Helper to extract a value by multiple possible keys
            const extractValueMulti = (keys, multiline = false) => {
                for (const key of keys) {
                    const cleanKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = multiline
                        ? new RegExp(`^${cleanKey}\\s*$\\n(.*?)(?=\\n^\\S|\\n\\n|$)`, 'ms')
                        : new RegExp(`^${cleanKey}:\\s*(.*)`, 'm');
                    const match = text.match(regex);
                    if (match) return match[1].trim();
                }
                return 'N/A';
            };

            // Helper to extract rating by multiple possible formats (more robust)
            const extractRatingMulti = (skillName, type) => {
                // Flexible regex: allow optional spaces, line breaks, and case-insensitive
                // Matches lines like:
                // Naming my emotions:\n  - Beginning: 2/5 | Current: 4/5
                // or with extra spaces, tabs, etc.
                const skillPattern = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const typePattern = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Try to match: SkillName (optional spaces/colon/linebreaks) - Type: X/5
                let regex = new RegExp(
                    skillPattern + '\\s*:?\\s*(?:\\n|\\r|\\r\\n)?\\s*-?\\s*' + typePattern + '\\s*:?\\s*(\\d+)\\s*/\\s*5',
                    'im'
                );
                let match = text.match(regex);
                if (match) return match[1];
                // Try to match: SkillName (anywhere in line) Type: X/5
                regex = new RegExp(
                    skillPattern + '[^\n]*' + typePattern + '\\s*:?\\s*(\\d+)\\s*/\\s*5',
                    'im'
                );
                match = text.match(regex);
                if (match) return match[1];
                return '0';
            };

            entry.name = extractValueMulti(['Student']);
            entry.date = extractValueMulti(['Date']);

            if (entry.name === 'N/A' || !entry.name) throw new Error("Could not parse Student Name.");
            if (entry.date === 'N/A' || !entry.date) throw new Error("Could not parse Date.");

            entry.namingEmotions_B = extractRatingMulti('Naming my emotions', 'Beginning');
            entry.namingEmotions_N = extractRatingMulti('Naming my emotions', 'Current');
            entry.calming_B = extractRatingMulti('Calming myself down', 'Beginning');
            entry.calming_N = extractRatingMulti('Calming myself down', 'Current');
            entry.understandingOthers_B = extractRatingMulti("Understanding others' feelings", 'Beginning');
            entry.understandingOthers_N = extractRatingMulti("Understanding others' feelings", 'Current');
            entry.solvingConflicts_B = extractRatingMulti('Solving conflicts peacefully', 'Beginning');
            entry.solvingConflicts_N = extractRatingMulti('Solving conflicts peacefully', 'Current');
            entry.growthScore = extractValueMulti(['Total Growth Score']);
            entry.proudestImprovement = extractValueMulti(["Skill I'm most proud of improving", 'Proudest Improvement'], true);
            entry.successStory = extractValueMulti(["A time I successfully used a skill", 'Success Story'], true);
            entry.nextGoal = extractValueMulti(["SEL skill to focus on", 'Next Skill to Practice', 'Next Goal'], true);
            entry.goalStrategy = extractValueMulti(["One way I can practice this is by", 'Practice Strategy', 'Goal Strategy'], true);

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
            const result = parseAndSaveReflection(pasteArea.value);
            modalStatus.textContent = result.message;
            if (result.success) {
                pasteArea.value = '';
                setTimeout(() => { modal.classList.remove('is-visible'); }, 2000);
            }
        };
    }
});
