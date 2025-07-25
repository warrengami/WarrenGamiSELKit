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

    const viewPortfolioBtn = document.getElementById('view-portfolio');
    if (viewPortfolioBtn) {
        viewPortfolioBtn.onclick = function() { window.open('student-portfolio.html', '_blank'); };
    }

    function parseAndSaveReflection(text) {
        try {
            // Split text into individual student reflections
            const studentSections = splitIntoStudentSections(text);
            let successCount = 0;
            let errorCount = 0;
            let errorMessages = [];

            // Process each student section
            studentSections.forEach((section, index) => {
                if (section.trim()) {
                    const result = parseSingleStudentReflection(section.trim());
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        errorMessages.push(`Student ${index + 1}: ${result.message}`);
                    }
                }
            });

            if (successCount > 0) {
                const message = `✅ Saved ${successCount} student reflection${successCount > 1 ? 's' : ''}.`;
                if (errorCount > 0) {
                    return { 
                        success: true, 
                        message: `${message} ${errorCount} failed to parse. Check format.` 
                    };
                }
                return { success: true, message };
            } else {
                return { 
                    success: false, 
                    message: `❌ Failed to parse any student reflections. Errors: ${errorMessages.join('; ')}` 
                };
            }

        } catch (error) {
            return { success: false, message: `Parse Error: ${error.message}` };
        }
    }

    // Split text into individual student sections
    function splitIntoStudentSections(text) {
        // Look for patterns that indicate a new student reflection
        const studentPatterns = [
            /^SEL Self-Assessment Summary\s*$/m,
            /^Student:\s*[^\n]+$/m,
            /^=====================================$/m
        ];

        const lines = text.split('\n');
        const sections = [];
        let currentSection = [];
        let inStudentSection = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line starts a new student section
            const isNewStudent = studentPatterns.some(pattern => pattern.test(line));
            
            if (isNewStudent && currentSection.length > 0) {
                // Save current section and start new one
                sections.push(currentSection.join('\n'));
                currentSection = [line];
                inStudentSection = true;
            } else if (inStudentSection || isNewStudent) {
                // Continue current section
                currentSection.push(line);
                inStudentSection = true;
            } else if (currentSection.length > 0) {
                // Continue current section
                currentSection.push(line);
            }
        }

        // Add the last section
        if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
        }

        // If no sections were found, treat the entire text as one section
        if (sections.length === 0) {
            sections.push(text);
        }

        return sections;
    }

    // Parse a single student reflection
    function parseSingleStudentReflection(text) {
        try {
            const entry = {};

            // Helper to extract a value by multiple possible keys (robust multiline)
            const allKeys = [
                'Skill I\'m most proud of improving', 'Proudest Improvement',
                'A time I successfully used a skill', 'Success Story',
                'SEL skill to focus on', 'Next Skill to Practice', 'Next Goal',
                'One way I can practice this is by', 'Practice Strategy', 'Goal Strategy'
            ];
            const extractValueMulti = (keys, multiline = false) => {
                for (const key of keys) {
                    const cleanKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    if (multiline) {
                        // Build a pattern for all possible keys except the current one
                        const otherKeys = allKeys.filter(k => !keys.includes(k)).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                        const stopPattern = otherKeys.length > 0 ? `(?=^(${otherKeys.join('|')})\\s*:|\\n\\n|$)` : '(?=\\n\\n|$)';
                        // Try multiple patterns for multiline fields
                        let patterns = [
                            // Pattern 1: Key: (optional line break) value
                            new RegExp('^' + cleanKey + '\\s*:?\\s*(?:\\n|\\r|\\r\\n)?([\s\S]*?)' + stopPattern, 'im'),
                            // Pattern 2: Key: value (same line)
                            new RegExp('^' + cleanKey + '\\s*:?\\s*([^\n]*?)(?=\\n|$)', 'im'),
                            // Pattern 3: Key (anywhere) followed by value
                            new RegExp(cleanKey + '\\s*:?\\s*([\s\S]*?)' + stopPattern, 'im')
                        ];
                        for (let regex of patterns) {
                            const match = text.match(regex);
                            if (match && match[1].trim()) return match[1].trim();
                        }
                    } else {
                        const regex = new RegExp(
                            '^' + cleanKey + '\\s*:?\\s*(.*)',
                            'im'
                        );
                        const match = text.match(regex);
                        if (match) return match[1].trim();
                    }
                }
                return 'N/A';
            };

            // Helper to extract rating by multiple possible formats (even more robust)
            const extractRatingMulti = (skillName, type) => {
                // Flexible regex: allow optional spaces, dashes, colons, and not anchored to start of line
                // Matches lines like:
                // Naming my emotions:  - Beginning: 2/5 | Current: 4/5
                // or with extra spaces, tabs, or dashes
                const skillPattern = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const typePattern = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Try to match: SkillName (optional spaces/colon/linebreaks) - Type: X/5
                let regex = new RegExp(
                    skillPattern + '\\s*:?\\s*(?:\\n|\\r|\\r\\n)?\\s*-?\\s*' + typePattern + '\\s*:?\\s*(\\d+)\\s*/\\s*5',
                    'im'
                );
                let match = text.match(regex);
                if (match) return match[1];
                // Try to match: SkillName (anywhere in line) Type: X/5 (not anchored)
                regex = new RegExp(
                    skillPattern + '[^\n]*' + typePattern + '\\s*:?\\s*(\\d+)\\s*/\\s*5',
                    'im'
                );
                match = text.match(regex);
                if (match) return match[1];
                // Try to match: Type: X/5 (anywhere in the text, fallback)
                regex = new RegExp(
                    typePattern + '\\s*:?\\s*(\\d+)\\s*/\\s*5',
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
