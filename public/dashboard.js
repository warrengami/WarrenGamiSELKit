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
        console.log('Splitting text into student sections...');
        
        // Look for patterns that indicate a new student reflection
        const studentPatterns = [
            /^SEL Self-Assessment Summary\s*$/m,
            /^Student:\s*[^\n]+$/m,
            /^=====================================$/m
        ];

        // Split by common separators that might appear between student reflections
        const separators = [
            /\n\s*Student Sample \d+:/g,
            /\n\s*Generated code\s*$/gm,
            /\n\s*IGNORE_WHEN_COPYING_START.*?IGNORE_WHEN_COPYING_END\s*$/gms,
            /\n\s*content_copy\s*$/gm,
            /\n\s*download\s*$/gm,
            /\n\s*Use code with caution\.\s*$/gm
        ];

        // First, clean up the text by removing common separator patterns
        let cleanedText = text;
        separators.forEach(separator => {
            cleanedText = cleanedText.replace(separator, '\n\n');
        });

        console.log('Cleaned text length:', cleanedText.length);

        const lines = cleanedText.split('\n');
        const sections = [];
        let currentSection = [];
        let inStudentSection = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line starts a new student section
            const isNewStudent = studentPatterns.some(pattern => pattern.test(line));
            
            if (isNewStudent && currentSection.length > 0) {
                // Save current section and start new one
                const sectionText = currentSection.join('\n').trim();
                if (sectionText && sectionText.includes('Student:')) {
                    sections.push(sectionText);
                    console.log('Found student section:', sectionText.substring(0, 100) + '...');
                }
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
            const sectionText = currentSection.join('\n').trim();
            if (sectionText && sectionText.includes('Student:')) {
                sections.push(sectionText);
                console.log('Found final student section:', sectionText.substring(0, 100) + '...');
            }
        }

        // If no sections were found, treat the entire text as one section
        if (sections.length === 0) {
            console.log('No sections found, treating entire text as one section');
            sections.push(text);
        }

        console.log('Total sections found:', sections.length);
        return sections;
    }

    // Parse a single student reflection
    function parseSingleStudentReflection(text) {
        try {
            console.log('=== PARSING STUDENT REFLECTION ===');
            console.log('Text to parse:', text.substring(0, 500) + '...');
            
            const entry = {};

            // Simple extraction functions
            const extractSimple = (key) => {
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith(key + ':')) {
                        const value = lines[i].substring(key.length + 1).trim();
                        console.log(`Found ${key}: "${value}"`);
                        return value;
                    }
                }
                console.log(`Not found: ${key}`);
                return 'N/A';
            };

            const extractMultiline = (key) => {
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim() === key + ':') {
                        // Collect lines until we hit another key or empty line
                        let value = '';
                        let j = i + 1;
                        while (j < lines.length && lines[j].trim() !== '' && !lines[j].trim().endsWith(':')) {
                            value += lines[j].trim() + ' ';
                            j++;
                        }
                        const result = value.trim();
                        console.log(`Found ${key}: "${result}"`);
                        return result || 'N/A';
                    }
                }
                console.log(`Not found: ${key}`);
                return 'N/A';
            };

            const extractRating = (skillName, type) => {
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith(skillName + ':')) {
                        // Look for the rating in the next few lines
                        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
                            const line = lines[j];
                            if (line.includes(type + ':') && line.includes('/5')) {
                                const match = line.match(/(\d+)\s*\/\s*5/);
                                if (match) {
                                    console.log(`Found ${skillName} ${type}: ${match[1]}`);
                                    return match[1];
                                }
                            }
                        }
                    }
                }
                console.log(`Not found: ${skillName} ${type}`);
                return '0';
            };

            // Extract basic info
            entry.name = extractSimple('Student');
            entry.date = extractSimple('Date');
            entry.growthScore = extractSimple('Total Growth Score');

            // Extract ratings
            entry.namingEmotions_B = extractRating('Naming my emotions', 'Beginning');
            entry.namingEmotions_N = extractRating('Naming my emotions', 'Current');
            entry.calming_B = extractRating('Calming myself down', 'Beginning');
            entry.calming_N = extractRating('Calming myself down', 'Current');
            entry.understandingOthers_B = extractRating("Understanding others' feelings", 'Beginning');
            entry.understandingOthers_N = extractRating("Understanding others' feelings", 'Current');
            entry.solvingConflicts_B = extractRating('Solving conflicts peacefully', 'Beginning');
            entry.solvingConflicts_N = extractRating('Solving conflicts peacefully', 'Current');

            // Extract reflections
            entry.proudestImprovement = extractMultiline('Proudest Improvement');
            entry.successStory = extractMultiline('Success Story');
            entry.nextGoal = extractMultiline('Next Skill to Practice');
            entry.goalStrategy = extractMultiline('Practice Strategy');

            if (entry.name === 'N/A' || !entry.name) throw new Error("Could not parse Student Name.");
            if (entry.date === 'N/A' || !entry.date) throw new Error("Could not parse Date.");

            const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
            data.push(entry);
            localStorage.setItem('selToolkit-selData', JSON.stringify(data));
            
            console.log('Final entry:', entry);
            return { success: true, message: `✅ Saved entry for ${entry.name}.` };

        } catch (error) {
            console.error('Parse error:', error);
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
