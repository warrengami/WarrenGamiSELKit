// File: sel-data-processor.js
// Enhanced SEL Data Processing System - Supports Teacher Observations & Student Reflections

class SELDataProcessor {
    constructor() {
        this.debugMode = false; // Set to false for production
    }

    // ===== TEACHER OBSERVATION METHODS =====
    
    // Save a teacher observation
    saveObservation(observation) {
        console.log('=== SAVING TEACHER OBSERVATION ===');
        console.log('Observation to save:', observation);
        
        const existingData = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        console.log('Existing observations:', existingData);
        
        const updatedData = [...existingData, observation];
        console.log('Updated observations:', updatedData);
        
        localStorage.setItem('selToolkit-observationLog', JSON.stringify(updatedData));
        this.log(`Saved observation for ${observation.studentName}`);
        
        // Verify the save
        const verifyData = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        console.log('Verified saved observations:', verifyData);
    }

    // Load all teacher observations
    loadObservations() {
        const data = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        const validData = data.filter(entry => {
            return entry && entry.studentName && entry.studentName.trim() !== '' && entry.observationText;
        });
        this.log(`Loaded ${validData.length} valid observations from localStorage`);
        return validData;
    }

    // Get observations for a specific student
    getObservationsForStudent(studentName) {
        const allObservations = this.loadObservations();
        return allObservations.filter(obs => obs.studentName === studentName);
    }

    // Get unique student names from observations
    getStudentNamesFromObservations() {
        const observations = this.loadObservations();
        const names = observations.map(obs => obs.studentName);
        return [...new Set(names)].sort();
    }

    // ===== STUDENT REFLECTION METHODS =====
    
    // Main processing function for multi-student input
    processMultiStudentInput(text) {
        console.log('=== SEL DATA PROCESSOR: Processing Multi-Student Input ===');
        
        const studentSections = this.splitIntoStudentSections(text);
        const results = {
            successCount: 0,
            errorCount: 0,
            errors: [],
            processedEntries: []
        };

        studentSections.forEach((section, index) => {
            if (section.trim()) {
                const result = this.processSingleStudent(section.trim());
                if (result.success) {
                    results.successCount++;
                    results.processedEntries.push(result.entry);
                } else {
                    results.errorCount++;
                    results.errors.push(`Student ${index + 1}: ${result.message}`);
                }
            }
        });

        return results;
    }

    // Split text into individual student sections
    splitIntoStudentSections(text) {
        console.log('Splitting text into student sections...');
        
        // Clean up common separator patterns
        const separators = [
            /\n\s*Student Sample \d+:/g,
            /\n\s*Generated code\s*$/gm,
            /\n\s*IGNORE_WHEN_COPYING_START.*?IGNORE_WHEN_COPYING_END\s*$/gms,
            /\n\s*content_copy\s*$/gm,
            /\n\s*download\s*$/gm,
            /\n\s*Use code with caution\.\s*$/gm
        ];

        let cleanedText = text;
        separators.forEach(separator => {
            cleanedText = cleanedText.replace(separator, '\n\n');
        });

        // Split by student markers
        const studentMarkers = [
            /^SEL Self-Assessment Summary\s*$/m,
            /^Student:\s*[^\n]+$/m
        ];

        const lines = cleanedText.split('\n');
        const sections = [];
        let currentSection = [];
        let inStudentSection = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isNewStudent = studentMarkers.some(pattern => pattern.test(line));
            
            if (isNewStudent && currentSection.length > 0) {
                const sectionText = currentSection.join('\n').trim();
                if (sectionText && sectionText.includes('Student:')) {
                    sections.push(sectionText);
                    this.log(`Found student section: ${sectionText.substring(0, 100)}...`);
                }
                currentSection = [line];
                inStudentSection = true;
            } else if (inStudentSection || isNewStudent) {
                currentSection.push(line);
                inStudentSection = true;
            } else if (currentSection.length > 0) {
                currentSection.push(line);
            }
        }

        // Add the last section
        if (currentSection.length > 0) {
            const sectionText = currentSection.join('\n').trim();
            if (sectionText && sectionText.includes('Student:')) {
                sections.push(sectionText);
                this.log(`Found final student section: ${sectionText.substring(0, 100)}...`);
            }
        }

        if (sections.length === 0) {
            this.log('No sections found, treating entire text as one section');
            sections.push(text);
        }

        this.log(`Total sections found: ${sections.length}`);
        return sections;
    }

    // Process a single student reflection
    processSingleStudent(text) {
        try {
            this.log('=== Processing Single Student ===');
            this.log(`Text to parse: ${text.substring(0, 300)}...`);
            
            const entry = {};

            // Extract basic information
            entry.name = this.extractSimpleField(text, 'Student');
            entry.date = this.extractSimpleField(text, 'Date');
            entry.growthScore = this.extractSimpleField(text, 'Total Growth Score');

            // Extract skill ratings
            entry.namingEmotions_B = this.extractSkillRating(text, 'Naming my emotions', 'Beginning');
            entry.namingEmotions_N = this.extractSkillRating(text, 'Naming my emotions', 'Current');
            entry.calming_B = this.extractSkillRating(text, 'Calming myself down', 'Beginning');
            entry.calming_N = this.extractSkillRating(text, 'Calming myself down', 'Current');
            entry.understandingOthers_B = this.extractSkillRating(text, "Understanding others' feelings", 'Beginning');
            entry.understandingOthers_N = this.extractSkillRating(text, "Understanding others' feelings", 'Current');
            entry.solvingConflicts_B = this.extractSkillRating(text, 'Solving conflicts peacefully', 'Beginning');
            entry.solvingConflicts_N = this.extractSkillRating(text, 'Solving conflicts peacefully', 'Current');

            // Extract reflection fields
            entry.proudestImprovement = this.extractMultilineField(text, 'Proudest Improvement');
            entry.successStory = this.extractMultilineField(text, 'Success Story');
            entry.nextGoal = this.extractMultilineField(text, 'Next Skill to Practice');
            entry.goalStrategy = this.extractMultilineField(text, 'Practice Strategy');

            // Validate required fields with fallbacks
            if (!entry.name || entry.name === 'N/A') {
                console.warn("Could not parse Student Name - using default");
                entry.name = 'Unknown Student';
            }
            if (!entry.date || entry.date === 'N/A') {
                console.warn("Could not parse Date - using current date");
                entry.date = new Date().toISOString().split('T')[0];
            }

            this.log('Final processed entry:', entry);
            return { success: true, entry };

        } catch (error) {
            this.log(`Parse error: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    // Extract simple single-line fields
    extractSimpleField(text, key) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith(key + ':')) {
                const value = line.substring(key.length + 1).trim();
                this.log(`Found ${key}: "${value}"`);
                return value;
            }
        }
        this.log(`Not found: ${key}`);
        return 'N/A';
    }

    // Extract skill ratings
    extractSkillRating(text, skillName, type) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith(skillName + ':')) {
                // Look for the rating in the next few lines
                for (let j = i; j < Math.min(i + 5, lines.length); j++) {
                    const ratingLine = lines[j];
                    if (ratingLine.includes(type + ':') && ratingLine.includes('/5')) {
                        const match = ratingLine.match(/(\d+)\s*\/\s*5/);
                        if (match) {
                            this.log(`Found ${skillName} ${type}: ${match[1]}`);
                            return match[1];
                        }
                    }
                }
            }
        }
        this.log(`Not found: ${skillName} ${type}`);
        return '0';
    }

    // Extract multiline fields
    extractMultilineField(text, key) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === key + ':') {
                let value = '';
                let j = i + 1;
                while (j < lines.length && lines[j].trim() !== '' && !lines[j].trim().endsWith(':')) {
                    value += lines[j].trim() + ' ';
                    j++;
                }
                const result = value.trim();
                this.log(`Found ${key}: "${result}"`);
                return result || 'N/A';
            }
        }
        this.log(`Not found: ${key}`);
        return 'N/A';
    }

    // Save processed entries to localStorage
    saveEntries(entries) {
        console.log('=== SAVING ENTRIES ===');
        console.log('Entries to save:', entries);
        
        const existingData = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        console.log('Existing data:', existingData);
        
        const updatedData = [...existingData, ...entries];
        console.log('Updated data:', updatedData);
        
        localStorage.setItem('selToolkit-selData', JSON.stringify(updatedData));
        this.log(`Saved ${entries.length} entries to localStorage`);
        
        // Verify the save
        const verifyData = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        console.log('Verified saved data:', verifyData);
    }

    // Load and validate data from localStorage
    loadData() {
        const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        const validData = data.filter(entry => {
            return entry && entry.name && entry.name.trim() !== '' && entry.name !== 'N/A';
        });
        this.log(`Loaded ${validData.length} valid entries from localStorage`);
        return validData;
    }

    // Get unique student names from reflections
    getStudentNamesFromReflections() {
        const reflections = this.loadData();
        const names = reflections.map(ref => ref.name);
        return [...new Set(names)].sort();
    }

    // Get all unique student names (from both observations and reflections)
    getAllStudentNames() {
        const observationNames = this.getStudentNamesFromObservations();
        const reflectionNames = this.getStudentNamesFromReflections();
        const allNames = [...observationNames, ...reflectionNames];
        return [...new Set(allNames)].sort();
    }

    // Get student reflection data
    getStudentReflections(studentName) {
        const allReflections = this.loadData();
        return allReflections.filter(ref => ref.name === studentName);
    }

    // Validate data entry
    validateEntry(entry) {
        const errors = [];
        
        if (!entry.name || entry.name === 'N/A') errors.push('Missing student name');
        if (!entry.date || entry.date === 'N/A') errors.push('Missing date');
        
        // Validate ratings are numbers
        const ratingFields = ['namingEmotions_B', 'namingEmotions_N', 'calming_B', 'calming_N', 
                             'understandingOthers_B', 'understandingOthers_N', 'solvingConflicts_B', 'solvingConflicts_N'];
        ratingFields.forEach(field => {
            const value = parseInt(entry[field]);
            if (isNaN(value) || value < 0 || value > 5) {
                errors.push(`Invalid rating for ${field}: ${entry[field]}`);
            }
        });

        return { isValid: errors.length === 0, errors };
    }

    // Debug logging
    log(message, data = null) {
        if (this.debugMode) {
            if (data) {
                console.log(`[SEL Processor] ${message}`, data);
            } else {
                console.log(`[SEL Processor] ${message}`);
            }
        }
    }
}

// Export for use in other files
window.SELDataProcessor = SELDataProcessor; 