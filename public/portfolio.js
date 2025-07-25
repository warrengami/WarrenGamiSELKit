// File: portfolio.js
// Individual SEL Growth Portfolio functionality

document.addEventListener('DOMContentLoaded', () => {
    let radarChart = null;
    const studentSelect = document.getElementById('student-select');
    const portfolioContent = document.getElementById('portfolio-content');
    const noStudentSelected = document.getElementById('no-student-selected');

    // Load data from localStorage
    function loadData() {
        const selData = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        const observationLog = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        return { selData, observationLog };
    }

    // Populate student dropdown
    function populateStudentDropdown() {
        const { selData } = loadData();
        const uniqueNames = [...new Set(selData.map(entry => entry.name).filter(Boolean))];
        
        // Clear existing options except the first one
        while (studentSelect.options.length > 1) {
            studentSelect.remove(1);
        }

        // Add student options
        uniqueNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            studentSelect.appendChild(option);
        });
    }

    // Get student data
    function getStudentData(studentName) {
        const { selData, observationLog } = loadData();
        
        // Get the most recent SEL assessment for this student
        const studentAssessments = selData
            .filter(entry => entry.name === studentName)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const latestAssessment = studentAssessments[0];
        
        // Get observations for this student
        const studentObservations = observationLog
            .filter(entry => entry.student === studentName)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return { assessment: latestAssessment, observations: studentObservations };
    }

    // Create radar chart
    function createRadarChart(studentData) {
        const ctx = document.getElementById('radar-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (radarChart) {
            radarChart.destroy();
        }

        const labels = ['Naming Emotions', 'Calming Down', 'Understanding Others', 'Solving Conflicts'];
        const beginningData = [
            parseInt(studentData.assessment.namingEmotions_B) || 0,
            parseInt(studentData.assessment.calming_B) || 0,
            parseInt(studentData.assessment.understandingOthers_B) || 0,
            parseInt(studentData.assessment.solvingConflicts_B) || 0
        ];
        const currentData = [
            parseInt(studentData.assessment.namingEmotions_N) || 0,
            parseInt(studentData.assessment.calming_N) || 0,
            parseInt(studentData.assessment.understandingOthers_N) || 0,
            parseInt(studentData.assessment.solvingConflicts_N) || 0
        ];

        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Beginning',
                        data: beginningData,
                        borderColor: '#73bdf5',
                        backgroundColor: 'rgba(115, 189, 245, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#73bdf5',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Current',
                        data: currentData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: '#27ae60',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
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
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.r;
                                return `${label}: ${value}/5`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update reflection content
    function updateReflectionContent(studentData) {
        const assessment = studentData.assessment;
        
        document.getElementById('proudest-improvement').textContent = 
            assessment.proudestImprovement || 'No data available';
        document.getElementById('success-story').textContent = 
            assessment.successStory || 'No data available';
        document.getElementById('next-goal').textContent = 
            assessment.nextGoal || 'No data available';
        document.getElementById('practice-strategy').textContent = 
            assessment.goalStrategy || 'No data available';
    }

    // Update metrics
    function updateMetrics(studentData) {
        const assessment = studentData.assessment;
        
        document.getElementById('growth-score').textContent = 
            assessment.growthScore || '+0';
        document.getElementById('assessment-date').textContent = 
            assessment.date || '-';
        document.getElementById('observations-count').textContent = 
            studentData.observations.length;
    }

    // Update observations
    function updateObservations(studentData) {
        const observationsContainer = document.getElementById('observations-content');
        
        if (studentData.observations.length === 0) {
            observationsContainer.innerHTML = '<div class="no-data">No observation data available for this student.</div>';
            return;
        }

        observationsContainer.innerHTML = studentData.observations.map(obs => `
            <div class="observation-item">
                <div class="observation-date">${obs.date}</div>
                <div class="observation-competency">${obs.competency}</div>
                <div class="observation-notes">${obs.notes}</div>
            </div>
        `).join('');
    }

    // Update portfolio for selected student
    function updatePortfolio(studentName) {
        if (!studentName) {
            portfolioContent.style.display = 'none';
            noStudentSelected.style.display = 'block';
            return;
        }

        const studentData = getStudentData(studentName);
        
        if (!studentData.assessment) {
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'No assessment data available for this student.';
            noStudentSelected.style.display = 'block';
            return;
        }

        portfolioContent.style.display = 'block';
        noStudentSelected.style.display = 'none';

        createRadarChart(studentData);
        updateReflectionContent(studentData);
        updateMetrics(studentData);
        updateObservations(studentData);
    }

    // Event listeners
    studentSelect.addEventListener('change', (e) => {
        updatePortfolio(e.target.value);
    });

    // Initialize
    populateStudentDropdown();
}); 