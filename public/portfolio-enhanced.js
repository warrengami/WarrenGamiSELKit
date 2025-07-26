// File: portfolio-enhanced.js
// Enhanced Student Portfolio functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check if SELDataProcessor is available
    if (typeof SELDataProcessor === 'undefined') {
        console.error('SELDataProcessor is not loaded!');
        return;
    }
    
    // Initialize the data processor
    const dataProcessor = new SELDataProcessor();
    
    // Get DOM elements with error checking
    const studentSelect = document.getElementById('student-select');
    const portfolioContent = document.getElementById('portfolio-content');
    const noStudentSelected = document.getElementById('no-student-selected');
    const printBtn = document.getElementById('print-btn');
    
    let skillsChart = null;
    
    // Check if required elements exist
    if (!studentSelect) {
        console.error('Student select element not found!');
        return;
    }
    if (!portfolioContent) {
        console.error('Portfolio content element not found!');
        return;
    }
    if (!noStudentSelected) {
        console.error('No student selected element not found!');
        return;
    }
    if (!printBtn) {
        console.error('Print button element not found!');
        return;
    }

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
        
        // Debug: Check if reflections have the expected structure
        if (reflections.length > 0) {
            const latest = reflections[0];
            console.log('Latest reflection structure:', {
                name: latest.name,
                date: latest.date,
                namingEmotions_N: latest.namingEmotions_N,
                calming_N: latest.calming_N,
                understandingOthers_N: latest.understandingOthers_N,
                solvingConflicts_N: latest.solvingConflicts_N,
                proudestImprovement: latest.proudestImprovement,
                successStory: latest.successStory,
                nextGoal: latest.nextGoal,
                goalStrategy: latest.goalStrategy
            });
        }
        
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

    // Load student reflections with historical view
    function loadStudentReflections(reflections) {
        const reflectionsContainer = document.getElementById('student-reflections');
        
        if (!reflectionsContainer) {
            console.error('Student reflections container not found!');
            return;
        }
        
        if (reflections.length === 0) {
            reflectionsContainer.innerHTML = '<div class="no-data">No student reflections yet</div>';
            return;
        }
        
        // Sort by date (newest first)
        reflections.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take the most recent reflection for current view
        const latestReflection = reflections[0];
        
        // Create current reflection section
        let reflectionsHTML = `
            <div class="current-reflection">
                <h5>📝 Current Reflection (${new Date(latestReflection.date).toLocaleDateString()})</h5>
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
            </div>
        `;
        
        // Add historical reflections if there are more than one
        if (reflections.length > 1) {
            reflectionsHTML += `
                <div class="historical-reflections">
                    <h5>📚 Growth Journey</h5>
                    <div class="reflection-timeline">
            `;
            
            // Show up to 3 previous reflections
            const historicalReflections = reflections.slice(1, 4);
            historicalReflections.forEach((reflection, index) => {
                const date = new Date(reflection.date).toLocaleDateString();
                reflectionsHTML += `
                    <div class="historical-reflection-item">
                        <div class="reflection-date">${date}</div>
                        <div class="reflection-content">
                            <div class="reflection-field">
                                <strong>Goal:</strong> ${reflection.nextGoal || 'Not specified'}
                            </div>
                            <div class="reflection-field">
                                <strong>Strategy:</strong> ${reflection.goalStrategy || 'Not specified'}
                            </div>
                            <div class="reflection-field">
                                <strong>Proudest:</strong> ${reflection.proudestImprovement || 'Not specified'}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            reflectionsHTML += `
                    </div>
                </div>
            `;
        }
        
        reflectionsContainer.innerHTML = reflectionsHTML;
    }
    
    // Load teacher observations
    function loadTeacherObservations(observations) {
        const observationsContainer = document.getElementById('teacher-observations');
        
        if (!observationsContainer) {
            console.error('Teacher observations container not found!');
            return;
        }
        
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
        
        if (!chartContainer) {
            console.error('Chart container element not found!');
            return;
        }
        
        if (reflections.length === 0) {
            chartContainer.style.display = 'none';
            return;
        }
        
        // Make sure chart container is visible and sized properly
        chartContainer.style.display = 'block';
        chartContainer.style.height = '350px';
        chartContainer.style.width = '100%';
        chartContainer.style.position = 'relative';
        
        // Ensure the canvas is properly sized
        chartContainer.width = chartContainer.offsetWidth;
        chartContainer.height = chartContainer.offsetHeight;
        
        // Get the most recent reflection for current ratings
        const latestReflection = reflections.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        // Prepare chart data with fallback values
        const chartData = {
            labels: ['Naming Emotions', 'Calming Down', 'Understanding Others', 'Solving Conflicts'],
            datasets: [{
                label: 'Current Skills',
                data: [
                    parseInt(latestReflection.namingEmotions_N) || 1,
                    parseInt(latestReflection.calming_N) || 1,
                    parseInt(latestReflection.understandingOthers_N) || 1,
                    parseInt(latestReflection.solvingConflicts_N) || 1
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
        
        // Create new chart with error handling
        try {
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js is not loaded');
            }
            
            // Get the canvas element directly
            const ctx = chartContainer.getContext('2d');
            skillsChart = new Chart(ctx, {
                type: 'radar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 20,
                            bottom: 20
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1
                            },
                            pointLabels: {
                                font: {
                                    size: 12
                                }
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
            console.log('Chart created successfully');
        } catch (error) {
            console.error('Error creating chart:', error);
            chartContainer.innerHTML = '<div style="text-align: center; padding: 2em; color: #666;">Chart could not be loaded</div>';
        }
    }

    // Generate key takeaways
    function generateKeyTakeaways(reflections, observations) {
        const takeawaysContainer = document.getElementById('key-takeaways');
        
        if (!takeawaysContainer) {
            console.error('Key takeaways container not found!');
            return;
        }
        
        if (reflections.length === 0 && observations.length === 0) {
            takeawaysContainer.innerHTML = '<div class="no-data">No data available for insights</div>';
            return;
        }
        
        const takeaways = [];
        
        // Analyze reflections
        if (reflections.length > 0) {
            const latestReflection = reflections.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // Calculate total score
            const totalScore = (parseInt(latestReflection.namingEmotions_N) || 1) +
                              (parseInt(latestReflection.calming_N) || 1) +
                              (parseInt(latestReflection.understandingOthers_N) || 1) +
                              (parseInt(latestReflection.solvingConflicts_N) || 1);
            
            takeaways.push({
                title: '🌊 Current SEL Score',
                value: `${totalScore}/20 (${Math.round(totalScore/20*100)}%)`
            });
            
            // Find strongest and weakest areas
            const skills = [
                { name: 'Naming Emotions', value: parseInt(latestReflection.namingEmotions_N) || 1 },
                { name: 'Calming Down', value: parseInt(latestReflection.calming_N) || 1 },
                { name: 'Understanding Others', value: parseInt(latestReflection.understandingOthers_N) || 1 },
                { name: 'Solving Conflicts', value: parseInt(latestReflection.solvingConflicts_N) || 1 }
            ];
            
            const strongest = skills.reduce((a, b) => a.value >= b.value ? a : b);
            const weakest = skills.reduce((a, b) => a.value <= b.value ? a : b);
            
            takeaways.push({
                title: '🏆 Strongest Area',
                value: `${strongest.name} (${strongest.value}/5)`
            });
            
            takeaways.push({
                title: '🌱 Growth Opportunity',
                value: `${weakest.name} (${weakest.value}/5)`
            });
            
            if (latestReflection.proudestImprovement && latestReflection.proudestImprovement !== 'N/A') {
                takeaways.push({
                    title: '💫 Proudest Achievement',
                    value: latestReflection.proudestImprovement
                });
            }
            
            if (latestReflection.nextGoal && latestReflection.nextGoal !== 'N/A') {
                takeaways.push({
                    title: '🎯 Current Goal',
                    value: latestReflection.nextGoal
                });
            }
            
            // Show goal progression if there are multiple reflections
            if (reflections.length > 1) {
                const previousGoals = reflections.slice(1, 4).map(r => r.nextGoal).filter(g => g && g !== 'N/A');
                if (previousGoals.length > 0) {
                    takeaways.push({
                        title: '📈 Goal Evolution',
                        value: `${previousGoals.length} previous goals tracked`
                    });
                }
            }
        }
        
        // Analyze observations
        if (observations.length > 0) {
            takeaways.push({
                title: '👁️ Observations',
                value: `${observations.length} teacher observations recorded`
            });
            
            // Count SEL tags
            const allTags = observations.flatMap(obs => obs.selTags || []);
            const tagCounts = {};
            allTags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
            
            if (Object.keys(tagCounts).length > 0) {
                const mostObserved = Object.entries(tagCounts)
                    .sort((a, b) => b[1] - a[1])[0];
                takeaways.push({
                    title: '🎯 Focus Area',
                    value: `${mostObserved[0]} (${mostObserved[1]} times)`
                });
            }
        }
        
        // Display takeaways
        takeawaysContainer.innerHTML = takeaways.map(takeaway => `
            <div class="takeaway-item">
                <strong>${takeaway.title}:</strong> ${takeaway.value}
            </div>
        `).join('');
    }

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Initialize the page
    populateStudentDropdown();
});

 