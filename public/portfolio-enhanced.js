// Enhanced Individual SEL Growth Portfolio functionality

document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio Enhanced: DOM loaded, initializing...');
    
    // Check if required dependencies are loaded
    if (typeof SELDataProcessor === 'undefined') {
        console.error('SELDataProcessor not found! Make sure sel-data-processor.js is loaded before portfolio-enhanced.js');
        return;
    }
    
    const dataProcessor = new SELDataProcessor();
    let radarChart = null;
    const studentSelect = document.getElementById('student-select');
    const portfolioContent = document.getElementById('portfolio-content');
    const noStudentSelected = document.getElementById('no-student-selected');

    // Validate required elements
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

    console.log('Portfolio Enhanced: All required elements found');

    function populateStudentDropdown() {
        console.log('Populating student dropdown...');
        try {
            const data = dataProcessor.loadData();
            console.log('Loaded data:', data);
            
            const uniqueNames = [...new Set(data.map(entry => entry.name).filter(Boolean))];
            console.log('Unique names found:', uniqueNames);
            
            while (studentSelect.options.length > 1) studentSelect.remove(1);
            uniqueNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                studentSelect.appendChild(option);
            });
            
            console.log(`Added ${uniqueNames.length} students to dropdown`);
        } catch (error) {
            console.error('Error populating student dropdown:', error);
        }
    }

    function getStudentData(studentName) {
        console.log(`Getting data for student: ${studentName}`);
        try {
            const data = dataProcessor.loadData();
            const observationLog = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
            const studentAssessments = data.filter(entry => entry.name === studentName)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestAssessment = studentAssessments[0];
            const studentObservations = observationLog.filter(entry => entry.student === studentName)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log('Student assessments:', studentAssessments);
            console.log('Latest assessment:', latestAssessment);
            console.log('Student observations:', studentObservations);
            
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
        } catch (error) {
            console.error('Error getting student data:', error);
            return { assessment: null, observations: [] };
        }
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

        // Add radar chart interactivity
        radarChart.options.plugins.tooltip.callbacks.afterBody = function(context) {
            const skillIndex = context[0].dataIndex;
            const skillKeys = ['namingEmotions', 'calming', 'understandingOthers', 'solvingConflicts'];
            highlightSkillCard(skillKeys[skillIndex]);
            return '';
        };
        
        // Remove highlight when tooltip is hidden
        radarChart.options.plugins.tooltip.callbacks.afterLabel = function(context) {
            setTimeout(() => {
                clearSkillCardHighlights();
            }, 100);
            return '';
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
        console.log(`Updating portfolio for student: ${studentName}`);
        
        if (!studentName) {
            console.log('No student selected, hiding portfolio content');
            portfolioContent.style.display = 'none';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        const studentData = getStudentData(studentName);
        console.log('Student data retrieved:', studentData);
        
        // Validate that we have assessment data
        if (!studentData.assessment) {
            console.log('No assessment data found for student');
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'No assessment data available for this student. Please add assessment data first.';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        // Validate assessment has required data
        const assessment = studentData.assessment;
        const requiredFields = ['namingEmotions_B', 'namingEmotions_N', 'calming_B', 'calming_N', 
                             'understandingOthers_B', 'understandingOthers_N', 'solvingConflicts_B', 'solvingConflicts_N'];
        
        console.log('Validating assessment fields:', requiredFields);
        console.log('Assessment data:', assessment);
        
        const hasValidData = requiredFields.every(field => {
            const value = assessment[field];
            const isValid = value && !isNaN(parseInt(value));
            console.log(`Field ${field}: ${value} (valid: ${isValid})`);
            return isValid;
        });
        
        if (!hasValidData) {
            console.log('Assessment data is incomplete');
            portfolioContent.style.display = 'none';
            noStudentSelected.innerHTML = 'Assessment data is incomplete for this student. Please ensure all skill ratings are provided.';
            noStudentSelected.style.display = 'block';
            return;
        }
        
        console.log('Assessment data is valid, updating portfolio...');
        
        try {
            portfolioContent.style.display = 'block';
            noStudentSelected.style.display = 'none';
            
            console.log('Updating portfolio components...');
            updateReflectionContent(studentData);
            updateMetrics(studentData);
            updateObservations(studentData);
            
            // Use new dynamic components
            createSpotlightCards(studentData);
            generateKeyTakeaways(studentData);
            createGrowthTimeline(studentData);
            
            // Create radar chart with a small delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    console.log('Creating radar chart...');
                    createRadarChart(studentData);
                    console.log('Radar chart created successfully');
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
            noStudentSelected.innerHTML = 'Error loading portfolio data. Please refresh the page and try again.';
            noStudentSelected.style.display = 'block';
        }
    }

    studentSelect.addEventListener('change', (e) => updatePortfolio(e.target.value));
    populateStudentDropdown();

    // Create dynamic spotlight cards to replace water gauges
    function createSpotlightCards(studentData) {
        const spotlightContainer = document.querySelector('.spotlight-cards');
        if (!spotlightContainer) return;
        
        const skills = [
            { key: 'namingEmotions', name: 'Naming Emotions', competency: 'self-awareness', descriptor: 'Emotional Recognition' },
            { key: 'calming', name: 'Calming Down', competency: 'self-management', descriptor: 'Emotional Regulation' },
            { key: 'understandingOthers', name: 'Understanding Others', competency: 'social-awareness', descriptor: 'Empathy & Perspective' },
            { key: 'solvingConflicts', name: 'Solving Conflicts', competency: 'relationship-skills', descriptor: 'Conflict Resolution' }
        ];
        
        const assessment = studentData.assessment;
        let spotlightHTML = '';
        
        skills.forEach(skill => {
            const beginningScore = parseInt(assessment[`${skill.key}_B`]) || 0;
            const currentScore = parseInt(assessment[`${skill.key}_N`]) || 0;
            const growth = currentScore - beginningScore;
            
            let growthClass = 'neutral';
            let growthText = '±0';
            if (growth > 0) {
                growthClass = 'positive';
                growthText = `+${growth}`;
            } else if (growth < 0) {
                growthClass = 'negative';
                growthText = `${growth}`;
            }
            
            spotlightHTML += `
                <div class="spotlight-card ${skill.competency}" data-skill="${skill.key}">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-score">${currentScore}/5</div>
                    <div class="skill-growth ${growthClass}">${growthText}</div>
                    <div class="skill-descriptor">${skill.descriptor}</div>
                </div>
            `;
        });
        
        spotlightContainer.innerHTML = spotlightHTML;
        
        // Add click handlers for interactivity
        const cards = spotlightContainer.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const skillKey = card.dataset.skill;
                filterObservationsBySkill(skillKey);
            });
        });
    }
    
    // Helper functions for skill card interactivity
    function highlightSkillCard(skillKey) {
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            if (card.dataset.skill === skillKey) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
    
    function clearSkillCardHighlights() {
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            card.classList.remove('active');
        });
    }
    
    // Enhanced filter function for skill cards
    function filterObservationsBySkill(skillKey) {
        const timelineContainer = document.getElementById('timeline-content');
        const allObservations = JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
        const currentStudent = document.getElementById('student-select').value;
        
        const skillMap = {
            'namingEmotions': 'Self-Awareness',
            'calming': 'Self-Management', 
            'understandingOthers': 'Social Awareness',
            'solvingConflicts': 'Relationship Skills'
        };
        
        const skillName = skillMap[skillKey];
        const filteredObservations = allObservations.filter(obs => 
            obs.student === currentStudent && obs.competency === skillName
        );
        
        // Highlight the clicked card
        const cards = document.querySelectorAll('.spotlight-card');
        cards.forEach(card => {
            if (card.dataset.skill === skillKey) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        if (filteredObservations.length > 0) {
            const timelineHTML = filteredObservations.map(obs => `
                <div class="timeline-item observation">
                    <div class="timeline-header">
                        <span class="timeline-icon">👁️</span>
                        <span class="timeline-date">${obs.date}</span>
                        <span class="timeline-type observation">${obs.competency}</span>
                    </div>
                    <div class="timeline-content">
                        ${obs.notes}
                    </div>
                </div>
            `).join('');
            timelineContainer.innerHTML = timelineHTML;
        } else {
            timelineContainer.innerHTML = `<div class="no-data">No observations found for ${skillName}.</div>`;
        }
        
        // Clear highlight after 3 seconds
        setTimeout(() => {
            clearSkillCardHighlights();
        }, 3000);
    }
    
    // Create unified growth timeline with reflections and observations
    function createGrowthTimeline(studentData) {
        const timelineContainer = document.getElementById('timeline-content');
        if (!timelineContainer) return;
        
        const assessment = studentData.assessment;
        const observations = studentData.observations;
        
        // Create timeline items
        const timelineItems = [];
        
        // Add student reflection as timeline item
        if (assessment.date) {
            timelineItems.push({
                type: 'reflection',
                date: assessment.date,
                content: `Student completed self-assessment with ${assessment.growthScore || '+0'} total growth.`,
                details: {
                    proudestImprovement: assessment.proudestImprovement,
                    successStory: assessment.successStory,
                    nextGoal: assessment.nextGoal,
                    practiceStrategy: assessment.goalStrategy
                }
            });
        }
        
        // Add teacher observations
        observations.forEach(obs => {
            timelineItems.push({
                type: 'observation',
                date: obs.date,
                content: obs.notes,
                competency: obs.competency
            });
        });
        
        // Sort by date (newest first)
        timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (timelineItems.length === 0) {
            timelineContainer.innerHTML = '<div class="no-data">No timeline data available for this student.</div>';
            return;
        }
        
        // Generate timeline HTML
        const timelineHTML = timelineItems.map(item => {
            if (item.type === 'reflection') {
                return `
                    <div class="timeline-item reflection">
                        <div class="timeline-header">
                            <span class="timeline-icon">📝</span>
                            <span class="timeline-date">${item.date}</span>
                            <span class="timeline-type reflection">Student Reflection</span>
                        </div>
                        <div class="timeline-content">
                            <p><strong>${item.content}</strong></p>
                            ${item.details.proudestImprovement ? `<p><strong>Proudest Improvement:</strong> ${item.details.proudestImprovement}</p>` : ''}
                            ${item.details.successStory ? `<p><strong>Success Story:</strong> ${item.details.successStory}</p>` : ''}
                            ${item.details.nextGoal ? `<p><strong>Next Goal:</strong> ${item.details.nextGoal}</p>` : ''}
                            ${item.details.practiceStrategy ? `<p><strong>Practice Strategy:</strong> ${item.details.practiceStrategy}</p>` : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="timeline-item observation">
                        <div class="timeline-header">
                            <span class="timeline-icon">👁️</span>
                            <span class="timeline-date">${item.date}</span>
                            <span class="timeline-type observation">${item.competency}</span>
                        </div>
                        <div class="timeline-content">
                            ${item.content}
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        timelineContainer.innerHTML = timelineHTML;
    }
    
    // Enhanced key takeaways with better microcopy and insights
    function generateKeyTakeaways(studentData) {
        const assessment = studentData.assessment;
        const observations = studentData.observations;
        
        const labels = ['Naming Emotions', 'Calming Down', 'Understanding Others', 'Solving Conflicts'];
        const beginning = [
            parseInt(assessment.namingEmotions_B) || 0,
            parseInt(assessment.calming_B) || 0,
            parseInt(assessment.understandingOthers_B) || 0,
            parseInt(assessment.solvingConflicts_B) || 0
        ];
        const current = [
            parseInt(assessment.namingEmotions_N) || 0,
            parseInt(assessment.calming_N) || 0,
            parseInt(assessment.understandingOthers_N) || 0,
            parseInt(assessment.solvingConflicts_N) || 0
        ];
        
        // Calculate overall growth
        let totalGrowth = 0;
        for (let i = 0; i < beginning.length; i++) {
            totalGrowth += current[i] - beginning[i];
        }
        
        // Find biggest improvement
        let maxGrowth = -Infinity, maxIdx = 0;
        for (let i = 0; i < beginning.length; i++) {
            const growth = current[i] - beginning[i];
            if (growth > maxGrowth) {
                maxGrowth = growth;
                maxIdx = i;
            }
        }
        
        // Find focus area (lowest current score)
        let minScore = Infinity, minIdx = 0;
        for (let i = 0; i < current.length; i++) {
            if (current[i] < minScore) {
                minScore = current[i];
                minIdx = i;
            }
        }
        
        // Generate enhanced insights
        const takeaways = [];
        
        // Growth Status with better microcopy
        if (totalGrowth > 0) {
            takeaways.push({
                label: 'Growth Achievement',
                value: `${labels[maxIdx]} showed the most significant improvement (+${maxGrowth} points), demonstrating strong progress in this area.`
            });
        } else if (totalGrowth === 0) {
            takeaways.push({
                label: 'Skill Consolidation',
                value: 'Student is demonstrating stability and consolidation of current SEL skills across all areas.'
            });
        } else {
            takeaways.push({
                label: 'Growth Focus',
                value: 'Student may need additional support to build upon current skill levels.'
            });
        }
        
        // Focus Area with context
        takeaways.push({
            label: 'Development Priority',
            value: `${labels[minIdx]} (${current[minIdx]}/5) is the primary area for continued development and practice.`
        });
        
        // Student Goal Integration
        if (assessment.nextGoal) {
            takeaways.push({
                label: 'Student-Directed Goal',
                value: `Student has identified "${assessment.nextGoal}" as their next priority, showing strong self-awareness in goal-setting.`
            });
        }
        
        // Teacher Insight with synthesis
        if (observations.length > 0) {
            const latestObservation = observations[0];
            const skillMap = {
                'Self-Awareness': 'namingEmotions',
                'Self-Management': 'calming',
                'Social Awareness': 'understandingOthers',
                'Relationship Skills': 'solvingConflicts'
            };
            
            const relatedSkill = skillMap[latestObservation.competency];
            if (relatedSkill) {
                const skillIndex = ['namingEmotions', 'calming', 'understandingOthers', 'solvingConflicts'].indexOf(relatedSkill);
                const skillGrowth = current[skillIndex] - beginning[skillIndex];
                
                if (skillGrowth > 0) {
                    takeaways.push({
                        label: 'Teacher-Student Alignment',
                        value: `Your observation from ${latestObservation.date} directly corroborates the student's reported progress in ${latestObservation.competency}, showing strong alignment between classroom data and student self-assessment.`
                    });
                } else {
                    takeaways.push({
                        label: 'Teacher Insight',
                        value: `Your observation from ${latestObservation.date} provides valuable context for understanding the student's current development in ${latestObservation.competency}.`
                    });
                }
            }
        }
        
        // Update the takeaways section
        const takeawaysContainer = document.querySelector('.key-takeaways');
        if (takeawaysContainer) {
            const takeawaysHTML = takeaways.map(takeaway => `
                <div class="takeaway-item">
                    <div class="takeaway-label">${takeaway.label}</div>
                    <div class="takeaway-value">${takeaway.value}</div>
                </div>
            `).join('');
            
            const existingTitle = takeawaysContainer.querySelector('h3');
            takeawaysContainer.innerHTML = existingTitle.outerHTML + takeawaysHTML;
        }
    }
}); 