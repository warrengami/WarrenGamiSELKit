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
        return { assessment: latestAssessment, observations: studentObservations };
    }

    // Helper: Get color for a score
    function getZoneColor(score) {
        if (score >= 4) return '#28a745'; // Green
        if (score >= 2) return '#ffc107'; // Yellow
        return '#dc3545'; // Red
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

    // Helper: Find biggest improvement and focus area
    function getGrowthInsights(beginning, current, labels) {
        let maxGrowth = -Infinity, minGrowth = Infinity, maxIdx = 0, minIdx = 0;
        let totalGrowth = 0, totalPossible = 0;
        for (let i = 0; i < beginning.length; i++) {
            const growth = current[i] - beginning[i];
            totalGrowth += growth;
            totalPossible += 5 - beginning[i];
            if (growth > maxGrowth) { maxGrowth = growth; maxIdx = i; }
            if (growth < minGrowth) { minGrowth = growth; minIdx = i; }
        }
        return {
            biggestImprovement: labels[maxIdx],
            focusArea: labels[minIdx],
            growthPercent: totalPossible > 0 ? Math.round((totalGrowth / totalPossible) * 100) : 0
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

        // Color points by zone
        const pointColors = currentData.map(getZoneColor);

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
                        data: beginningData, // Start at beginning for animation
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: pointColors,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1200,
                    onComplete: function() {
                        // Animate to current data after initial render
                        setTimeout(() => {
                            animateChart(radarChart, [beginningData, currentData]);
                        }, 200);
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 },
                        angleLines: { color: '#e0e0e0' },
                        grid: { color: '#e0e0e0' }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        borderColor: '#fff',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.r;
                                let extra = '';
                                if (label === 'Current') {
                                    // Show growth %
                                    const idx = context.dataIndex;
                                    const growth = currentData[idx] - beginningData[idx];
                                    extra = ` (Growth: ${growth >= 0 ? '+' : ''}${growth})`;
                                    // Show snippet if available
                                    if (idx === 0 && studentData.assessment.proudestImprovement)
                                        extra += `\nProudest: ${studentData.assessment.proudestImprovement}`;
                                    if (idx === 1 && studentData.assessment.goalStrategy)
                                        extra += `\nStrategy: ${studentData.assessment.goalStrategy}`;
                                    if (idx === 2 && studentData.assessment.successStory)
                                        extra += `\nStory: ${studentData.assessment.successStory}`;
                                    if (idx === 3 && studentData.assessment.nextGoal)
                                        extra += `\nNext: ${studentData.assessment.nextGoal}`;
                                }
                                return `${label}: ${value}/5${extra}`;
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 6,
                        hoverRadius: 10,
                        backgroundColor: function(context) {
                            // Pulse effect for biggest improvement
                            const idx = context.dataIndex;
                            const growth = currentData[idx] - beginningData[idx];
                            if (growth >= 2) {
                                return {
                                    type: 'radialGradient',
                                    colors: [getZoneColor(currentData[idx]), '#fff']
                                };
                            }
                            return getZoneColor(currentData[idx]);
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
        if (!studentData.assessment) {
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'No assessment data available for this student.';
            noStudentSelected.style.display = 'block';
            return;
        }
        portfolioContent.style.display = 'block';
        noStudentSelected.style.display = 'none';
        updateReflectionContent(studentData);
        updateMetrics(studentData);
        updateObservations(studentData);
        updateInsights(studentData);
        setTimeout(() => createRadarChart(studentData), 100);
    }

    studentSelect.addEventListener('change', (e) => updatePortfolio(e.target.value));
    populateStudentDropdown();
}); 