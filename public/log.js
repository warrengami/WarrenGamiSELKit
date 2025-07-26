// File: log.js
// Teacher Observation Log functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the data processor
    const dataProcessor = new SELDataProcessor();
    
    // Get DOM elements
    const form = document.getElementById('observation-form');
    const studentSelect = document.getElementById('student-select');
    const newStudentInput = document.getElementById('new-student-input');
    const newStudentName = document.getElementById('new-student-name');
    const observationDate = document.getElementById('observation-date');
    const observationText = document.getElementById('observation-text');
    const nextStep = document.getElementById('next-step');
    const successMessage = document.getElementById('success-message');
    const observationsList = document.getElementById('observations-list');
    
    // Set default date to today
    observationDate.value = new Date().toISOString().slice(0, 10);
    
    // Populate student dropdown
    function populateStudentDropdown() {
        console.log('=== POPULATING STUDENT DROPDOWN ===');
        
        // Get all unique student names from both observations and reflections
        const allStudentNames = dataProcessor.getAllStudentNames();
        console.log('All student names:', allStudentNames);
        
        // Clear existing options except the first two
        while (studentSelect.children.length > 2) {
            studentSelect.removeChild(studentSelect.lastChild);
        }
        
        // Add existing students
        allStudentNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            studentSelect.appendChild(option);
        });
        
        console.log(`Populated dropdown with ${allStudentNames.length} students`);
    }
    
    // Handle student selection
    studentSelect.addEventListener('change', (e) => {
        if (e.target.value === 'new') {
            newStudentInput.style.display = 'block';
            newStudentName.focus();
        } else {
            newStudentInput.style.display = 'none';
            newStudentName.value = '';
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const selectedStudent = studentSelect.value;
        const newStudent = newStudentName.value.trim();
        const studentName = selectedStudent === 'new' ? newStudent : selectedStudent;
        const date = observationDate.value;
        const text = observationText.value.trim();
        const nextStepText = nextStep.value.trim();
        
        // Validate required fields
        if (!studentName) {
            alert('Please select or enter a student name.');
            return;
        }
        
        if (!text) {
            alert('Please enter an observation.');
            return;
        }
        
        // Get selected SEL tags
        const selectedTags = Array.from(document.querySelectorAll('input[name="sel-tags"]:checked'))
            .map(checkbox => checkbox.value);
        
        // Create observation object
        const observation = {
            observationID: Date.now().toString(),
            studentName: studentName,
            date: date,
            observationText: text,
            selTags: selectedTags,
            nextStep: nextStepText || null
        };
        
        console.log('=== SAVING OBSERVATION ===');
        console.log('Observation object:', observation);
        
        // Save the observation
        dataProcessor.saveObservation(observation);
        
        // Show success message
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
        
        // Clear form
        form.reset();
        observationDate.value = new Date().toISOString().slice(0, 10);
        newStudentInput.style.display = 'none';
        
        // Refresh student dropdown and observations list
        populateStudentDropdown();
        displayRecentObservations();
    });
    
    // Display recent observations
    function displayRecentObservations() {
        console.log('=== DISPLAYING RECENT OBSERVATIONS ===');
        
        const observations = dataProcessor.loadObservations();
        console.log('All observations:', observations);
        
        // Sort by date (newest first)
        observations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take only the most recent 10
        const recentObservations = observations.slice(0, 10);
        
        if (recentObservations.length === 0) {
            observationsList.innerHTML = '<div class="no-observations">No observations yet. Start by adding your first observation above!</div>';
            return;
        }
        
        observationsList.innerHTML = '';
        
        recentObservations.forEach(observation => {
            const card = document.createElement('div');
            card.className = 'observation-card';
            
            const header = document.createElement('div');
            header.className = 'observation-header';
            
            const studentName = document.createElement('div');
            studentName.className = 'student-name';
            studentName.textContent = observation.studentName;
            
            const date = document.createElement('div');
            date.className = 'observation-date';
            date.textContent = new Date(observation.date).toLocaleDateString();
            
            header.appendChild(studentName);
            header.appendChild(date);
            
            const text = document.createElement('div');
            text.className = 'observation-text';
            text.textContent = observation.observationText;
            
            card.appendChild(header);
            card.appendChild(text);
            
            // Add SEL tags if any
            if (observation.selTags && observation.selTags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'sel-tags-display';
                
                observation.selTags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'sel-tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
                
                card.appendChild(tagsContainer);
            }
            
            // Add next step if any
            if (observation.nextStep) {
                const nextStepElement = document.createElement('div');
                nextStepElement.className = 'next-step';
                nextStepElement.textContent = `Next: ${observation.nextStep}`;
                card.appendChild(nextStepElement);
            }
            
            observationsList.appendChild(card);
        });
        
        console.log(`Displayed ${recentObservations.length} recent observations`);
    }
    
    // Initialize the page
    populateStudentDropdown();
    displayRecentObservations();
}); 