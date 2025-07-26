// Enhanced Individual SEL Growth Portfolio functionality

document.addEventListener('DOMContentLoaded', () => {
    const dataProcessor = new SELDataProcessor();
    let radarChart = null;
    const studentSelect = document.getElementById('student-select');
    const portfolioContent = document.getElementById('portfolio-content');
    const noStudentSelected = document.getElementById('no-student-selected');

    function populateStudentDropdown() {
        const data = dataProcessor.loadData();
        const uniqueNames = [...new Set(data.map(entry => entry.name).filter(Boolean))];
        while (studentSelect.options.length > 1) studentSelect.remove(1);
        uniqueNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            studentSelect.appendChild(option);
        });
    }

    function getStudentData(studentName) {
        const data = dataProcessor.loadData();
        const observationLog = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        const studentAssessments = data.filter(entry => entry.name === studentName)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestAssessment = studentAssessments[0];
        const studentObservations = observationLog.filter(entry => entry.student === studentName)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Validate assessment data
        if (latestAssessment) {
            // Ensure all required fields exist
            const requiredFields = ['namingEmotions_B', 'namingEmotions_N', 'calming_B', 'calming_N', 
                                  'understandingOthers_B', 'understandingOthers_N', 'solvingConflicts_B', 'solvingConflicts_N'];
            requiredFields.forEach(field => {
                if (!latestAssessment[field] || isNaN(parseInt(latestAssessment[field]))) {
                    latestAssessment[field] = '0';
                }
            });
        }
        
        return { assessment: latestAssessment, observations: studentObservations };
    }

    // Helper: Get color for a score - unified color scheme
    function getZoneColor(score) {
        const numScore = parseInt(score);
        if (numScore >= 4) return '#10b981'; // Green - Excellent
        if (numScore >= 3) return '#3b82f6'; // Blue - Good  
        if (numScore >= 2) return '#f59e0b'; // Orange - Developing
        return '#ef4444'; // Red - Needs Support
    }

    // Helper: Animate data transition
    function animateChart(chart, newData) {
        chart.data.datasets.forEach((dataset, i) => {
            dataset.data.forEach((_, j) => {
                dataset.data[j] = newData[i][j];
            });
        });
        chart.update();
    }

    // Helper: Find biggest improvement and focus area - FIXED CALCULATION
    function getGrowthInsights(beginning, current, labels) {
        let maxGrowth = -Infinity, minGrowth = Infinity, maxIdx = 0, minIdx = 0;
        let totalGrowth = 0, totalBeginning = 0, totalCurrent = 0;
        
        for (let i = 0; i < beginning.length; i++) {
            const growth = current[i] - beginning[i];
            totalGrowth += growth;
            totalBeginning += beginning[i];
            totalCurrent += current[i];
            
            if (growth > maxGrowth) { 
                maxGrowth = growth; 
                maxIdx = i; 
            }
            if (growth < minGrowth) { 
                minGrowth = growth; 
                minIdx = i; 
            }
        }
        
        // Calculate overall growth percentage
        const avgBeginning = totalBeginning / beginning.length;
        const avgCurrent = totalCurrent / current.length;
        const overallGrowth = avgCurrent - avgBeginning;
        const maxPossibleGrowth = 5 - avgBeginning;
        const growthPercent = maxPossibleGrowth > 0 ? Math.round((overallGrowth / maxPossibleGrowth) * 100) : 0;
        
        return {
            biggestImprovement: maxGrowth > 0 ? labels[maxIdx] : 'No improvement yet',
            focusArea: minGrowth < 0 ? labels[minIdx] : (minGrowth === 0 ? 'All areas stable' : labels[minIdx]),
            growthPercent: Math.max(0, growthPercent) // Ensure non-negative
        };
    }

    // Enhanced radar chart with animation, color zones, and tooltips
    function createRadarChart(studentData) {
        const ctx = document.getElementById('radar-chart').getContext('2d');
        if (radarChart) radarChart.destroy();

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
                        pointBorderColor: '#73bdf5',
                        pointRadius: 4
                    },
                    {
                        label: 'Current',
                        data: currentData,
                        borderColor: '#0f2c4d',
                        backgroundColor: 'rgba(15, 44, 77, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: currentData.map(getZoneColor),
                        pointBorderColor: currentData.map(getZoneColor),
                        pointRadius: 6,
                        pointHoverRadius: 8
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
                            stepSize: 1,
                            color: '#64748b'
                        },
                        grid: {
                            color: '#e2e8f0'
                        },
                        pointLabels: {
                            color: '#1e293b',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: '#1e293b',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 44, 77, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#0f2c4d',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.r;
                                const datasetIndex = context.datasetIndex;
                                const dataIndex = context.dataIndex;
                                
                                if (datasetIndex === 1) { // Current dataset
                                    const growth = currentData[dataIndex] - beginningData[dataIndex];
                                    const growthText = growth > 0 ? ` (+${growth})` : growth < 0 ? ` (${growth})` : '';
                                    return `${label}: ${value}/5${growthText}`;
                                }
                                return `${label}: ${value}/5`;
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        backgroundColor: function(context) {
                            if (context.datasetIndex === 1) {
                                return getZoneColor(currentData[context.dataIndex]);
                            }
                            return '#73bdf5';
                        }
                    }
                }
            }
        });

        // Animate the 'Current' dataset from beginning to current
        setTimeout(() => {
            animateChart(radarChart, [beginningData, currentData]);
        }, 400);

        // Add pulsing effect to points with significant improvement
        radarChart.options.plugins.afterDraw = function(chart) {
            const ctx = chart.ctx;
            chart.data.datasets[1].data.forEach((val, idx) => {
                const growth = currentData[idx] - beginningData[idx];
                if (growth >= 2) {
                    // Draw a pulsing circle (for demo, not true animation)
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(
                        chart.getDatasetMeta(1).data[idx].x,
                        chart.getDatasetMeta(1).data[idx].y,
                        16, 0, 2 * Math.PI
                    );
                    ctx.strokeStyle = getZoneColor(currentData[idx]);
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 6;
                    ctx.stroke();
                    ctx.restore();
                }
            });
        };
    }

    function updateReflectionContent(studentData) {
        const assessment = studentData.assessment;
        document.getElementById('proudest-improvement').textContent = assessment.proudestImprovement || 'No data available';
        document.getElementById('success-story').textContent = assessment.successStory || 'No data available';
        document.getElementById('next-goal').textContent = assessment.nextGoal || 'No data available';
        document.getElementById('practice-strategy').textContent = assessment.goalStrategy || 'No data available';
    }

    function updateMetrics(studentData) {
        const assessment = studentData.assessment;
        document.getElementById('growth-score').textContent = assessment.growthScore || '+0';
        document.getElementById('assessment-date').textContent = assessment.date || '-';
        document.getElementById('observations-count').textContent = studentData.observations.length;
    }

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

    function updateInsights(studentData) {
        const labels = ['Naming Emotions', 'Calming Down', 'Understanding Others', 'Solving Conflicts'];
        const beginning = [
            parseInt(studentData.assessment.namingEmotions_B) || 0,
            parseInt(studentData.assessment.calming_B) || 0,
            parseInt(studentData.assessment.understandingOthers_B) || 0,
            parseInt(studentData.assessment.solvingConflicts_B) || 0
        ];
        const current = [
            parseInt(studentData.assessment.namingEmotions_N) || 0,
            parseInt(studentData.assessment.calming_N) || 0,
            parseInt(studentData.assessment.understandingOthers_N) || 0,
            parseInt(studentData.assessment.solvingConflicts_N) || 0
        ];
        const insights = getGrowthInsights(beginning, current, labels);
        document.getElementById('biggest-improvement').textContent = insights.biggestImprovement;
        document.getElementById('focus-area').textContent = insights.focusArea;
        document.getElementById('growth-percentage').textContent = insights.growthPercent + '%';
    }

    function updatePortfolio(studentName) {
        if (!studentName) {
            portfolioContent.style.display = 'none';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        const studentData = getStudentData(studentName);
        
        // Validate that we have assessment data
        if (!studentData.assessment) {
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'No assessment data available for this student.';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        // Validate assessment has required data
        const assessment = studentData.assessment;
        const hasValidData = ['namingEmotions_B', 'namingEmotions_N', 'calming_B', 'calming_N', 
                             'understandingOthers_B', 'understandingOthers_N', 'solvingConflicts_B', 'solvingConflicts_N']
            .every(field => assessment[field] && !isNaN(parseInt(assessment[field])));
        
        if (!hasValidData) {
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'Assessment data is incomplete for this student.';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        try {
            portfolioContent.style.display = 'block';
            noStudentSelected.style.display = 'none';
            
            updateReflectionContent(studentData);
            updateMetrics(studentData);
            updateObservations(studentData);
            updateInsights(studentData);
            
            // Create radar chart with a small delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    createRadarChart(studentData);
                } catch (chartError) {
                    console.error('Error creating radar chart:', chartError);
                    // Fallback: show error message in chart container
                    const chartContainer = document.querySelector('.chart-container');
                    if (chartContainer) {
                        chartContainer.innerHTML = '<p style="color: #dc3545; text-align: center;">Error loading chart. Please refresh the page.</p>';
                    }
                }
            }, 100);
            
        } catch (error) {
            console.error('Error updating portfolio:', error);
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'Error loading portfolio data. Please refresh the page.';
            noStudentSelected.style.display = 'block';
        }
    }

    studentSelect.addEventListener('change', (e) => updatePortfolio(e.target.value));
    populateStudentDropdown();
}); 