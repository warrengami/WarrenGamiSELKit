// File: portfolio-enhanced.js
// Enhanced Student Portfolio functionality

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the data processor
    const dataProcessor = new SELDataProcessor();
    
    // Get DOM elements
    const studentSelect = document.getElementById('student-select');
    const portfolioContent = document.getElementById('portfolio-content');
    const noStudentSelected = document.getElementById('no-student-selected');
    const printBtn = document.getElementById('print-btn');
    
    let skillsChart = null;

    // Populate student dropdown
    function populateStudentDropdown() {
        console.log('=== POPULATING STUDENT DROPDOWN ===');
        
        // Get all unique student names from both observations and reflections
        const allStudentNames = dataProcessor.getAllStudentNames();
        console.log('All student names:', allStudentNames);
        
        // Clear existing options except the first one
        while (studentSelect.children.length > 1) {
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
        const selectedStudent = e.target.value;
        
        if (selectedStudent) {
            loadStudentPortfolio(selectedStudent);
        } else {
            portfolioContent.style.display = 'none';
            noStudentSelected.style.display = 'block';
            printBtn.style.display = 'none';
        }
    });
    
    // Load student portfolio data
    function loadStudentPortfolio(studentName) {
        console.log(`=== LOADING PORTFOLIO FOR ${studentName} ===`);
        
        // Get student data
        const reflections = dataProcessor.getStudentReflections(studentName);
        const observations = dataProcessor.getObservationsForStudent(studentName);
        
        console.log('Student reflections:', reflections);
        console.log('Student observations:', observations);
        
        // Display portfolio content
        portfolioContent.style.display = 'grid';
        noStudentSelected.style.display = 'none';
        printBtn.style.display = 'block';
        
        // Load student reflections
        loadStudentReflections(reflections);
        
        // Load teacher observations
        loadTeacherObservations(observations);
        
        // Create skills chart
        createSkillsChart(reflections);
        
        // Generate key takeaways
        generateKeyTakeaways(reflections, observations);
    }

    // Load student reflections
    function loadStudentReflections(reflections) {
        const reflectionsContainer = document.getElementById('student-reflections');
        
        if (reflections.length === 0) {
            reflectionsContainer.innerHTML = '<div class="no-data">No student reflections yet</div>';
            return;
        }
        
        // Sort by date (newest first)
        reflections.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take the most recent reflection
        const latestReflection = reflections[0];
        
        reflectionsContainer.innerHTML = `
            <div class="reflection-item">
                <strong>Proudest Improvement:</strong><br>
                ${latestReflection.proudestImprovement || 'Not specified'}
            </div>
            <div class="reflection-item">
                <strong>Success Story:</strong><br>
                ${latestReflection.successStory || 'Not specified'}
            </div>
            <div class="reflection-item">
                <strong>Next Goal:</strong><br>
                ${latestReflection.nextGoal || 'Not specified'}
            </div>
            <div class="reflection-item">
                <strong>Practice Strategy:</strong><br>
                ${latestReflection.goalStrategy || 'Not specified'}
            </div>
        `;
    }
    
    // Load teacher observations
    function loadTeacherObservations(observations) {
        const observationsContainer = document.getElementById('teacher-observations');
        
        if (observations.length === 0) {
            observationsContainer.innerHTML = '<div class="no-data">No teacher observations yet</div>';
            return;
        }
        
        // Sort by date (newest first)
        observations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take the 5 most recent observations
        const recentObservations = observations.slice(0, 5);
        
        observationsContainer.innerHTML = '';
        
        recentObservations.forEach(observation => {
            const observationElement = document.createElement('div');
            observationElement.className = 'observation-item';
            
            const date = new Date(observation.date).toLocaleDateString();
            
            let tagsHTML = '';
            if (observation.selTags && observation.selTags.length > 0) {
                tagsHTML = `
                    <div class="sel-tags">
                        ${observation.selTags.map(tag => `<span class="sel-tag">${tag}</span>`).join('')}
                    </div>
                `;
            }
            
            observationElement.innerHTML = `
                <div class="observation-date">${date}</div>
                <div class="observation-text">${observation.observationText}</div>
                ${tagsHTML}
                ${observation.nextStep ? `<div style="font-style: italic; color: #666; margin-top: 0.5em;">Next: ${observation.nextStep}</div>` : ''}
            `;
            
            observationsContainer.appendChild(observationElement);
        });
    }

    // Create skills radar chart
    function createSkillsChart(reflections) {
        const chartContainer = document.getElementById('skills-chart');
        
        if (reflections.length === 0) {
            chartContainer.style.display = 'none';
            return;
        }
        
        chartContainer.style.display = 'block';
        
        // Get the most recent reflection for current ratings
        const latestReflection = reflections.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        // Prepare chart data
        const chartData = {
            labels: ['Naming Emotions', 'Calming Down', 'Understanding Others', 'Solving Conflicts'],
            datasets: [{
                label: 'Current Skills',
                data: [
                    parseInt(latestReflection.namingEmotions_N) || 0,
                    parseInt(latestReflection.calming_N) || 0,
                    parseInt(latestReflection.understandingOthers_N) || 0,
                    parseInt(latestReflection.solvingConflicts_N) || 0
                ],
                backgroundColor: 'rgba(115, 189, 245, 0.2)',
                borderColor: 'rgba(115, 189, 245, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(115, 189, 245, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(115, 189, 245, 1)'
            }]
        };
        
        // Destroy existing chart if it exists
        if (skillsChart) {
            skillsChart.destroy();
        }
        
        // Create new chart
        const ctx = chartContainer.getContext('2d');
        skillsChart = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Generate key takeaways
    function generateKeyTakeaways(reflections, observations) {
        const takeawaysContainer = document.getElementById('key-takeaways');
        
        if (reflections.length === 0 && observations.length === 0) {
            takeawaysContainer.innerHTML = '<div class="no-data">No data available for insights</div>';
            return;
        }
        
        const takeaways = [];
        
        // Analyze reflections
        if (reflections.length > 0) {
            const latestReflection = reflections.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // Calculate total score
            const totalScore = (parseInt(latestReflection.namingEmotions_N) || 0) +
                              (parseInt(latestReflection.calming_N) || 0) +
                              (parseInt(latestReflection.understandingOthers_N) || 0) +
                              (parseInt(latestReflection.solvingConflicts_N) || 0);
            
            takeaways.push({
                title: 'Current SEL Score',
                value: `${totalScore}/20 (${Math.round(totalScore/20*100)}%)`
            });
            
            if (latestReflection.proudestImprovement && latestReflection.proudestImprovement !== 'N/A') {
                takeaways.push({
                    title: 'Proudest Achievement',
                    value: latestReflection.proudestImprovement
                });
            }
            
            if (latestReflection.nextGoal && latestReflection.nextGoal !== 'N/A') {
                takeaways.push({
                    title: 'Current Goal',
                    value: latestReflection.nextGoal
                });
            }
        }
        
        // Analyze observations
        if (observations.length > 0) {
            // Count SEL competencies
            const competencyCounts = {};
            observations.forEach(obs => {
                if (obs.selTags) {
                    obs.selTags.forEach(tag => {
                        competencyCounts[tag] = (competencyCounts[tag] || 0) + 1;
                    });
                }
            });
            
            // Find most observed competency
            const mostObserved = Object.entries(competencyCounts)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (mostObserved) {
                takeaways.push({
                    title: 'Strongest SEL Area',
                    value: `${mostObserved[0]} (${mostObserved[1]} observations)`
                });
            }
            
            takeaways.push({
                title: 'Teacher Observations',
                value: `${observations.length} meaningful moments captured`
            });
        }
        
        // Display takeaways
        takeawaysContainer.innerHTML = '';
        takeaways.forEach(takeaway => {
            const takeawayElement = document.createElement('div');
            takeawayElement.className = 'takeaway-item';
            takeawayElement.innerHTML = `
                <strong>${takeaway.title}:</strong><br>
                ${takeaway.value}
            `;
            takeawaysContainer.appendChild(takeawayElement);
        });
    }

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Initialize the page
    populateStudentDropdown();
});

 