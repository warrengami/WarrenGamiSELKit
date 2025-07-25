// File: sel-data.js
document.addEventListener('DOMContentLoaded', () => {
    // Test if SELDataProcessor is available
    console.log('=== SEL DATA PAGE LOADED ===');
    console.log('SELDataProcessor available:', typeof SELDataProcessor !== 'undefined');
    
    // Initialize the unified data processor
    const dataProcessor = new SELDataProcessor();
    console.log('DataProcessor created:', dataProcessor);

    function renderTable() {
        const data = dataProcessor.loadData();
        console.log('=== SEL DATA DEBUG ===');
        console.log('Raw localStorage data:', localStorage.getItem('selToolkit-selData'));
        console.log('Processed data:', data);
        console.log('Data length:', data.length);
        
        const tbody = document.querySelector('#sel-data-table tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;padding:2em;">No data has been entered yet. Go to the dashboard to input student reflections.</td></tr>';
            return;
        }

        data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Show newest first

        data.forEach(entry => {
            const tr = document.createElement('tr');
            
            // Ensure ratings are valid numbers
            const ratingsHTML = `
                <p><b>Naming Emotions:</b> ${validateRating(entry.namingEmotions_B)} ➞ ${validateRating(entry.namingEmotions_N)}</p>
                <p><b>Calming Down:</b> ${validateRating(entry.calming_B)} ➞ ${validateRating(entry.calming_N)}</p>
                <p><b>Understanding Others:</b> ${validateRating(entry.understandingOthers_B)} ➞ ${validateRating(entry.understandingOthers_N)}</p>
                <p><b>Solving Conflicts:</b> ${validateRating(entry.solvingConflicts_B)} ➞ ${validateRating(entry.solvingConflicts_N)}</p>
            `;
            
            const reflectionsHTML = `
                <p><span class="goal-title">Proudest Improvement:</span><br>${validateText(entry.proudestImprovement)}</p>
                <p><span class="goal-title">Success Story:</span><br>${validateText(entry.successStory)}</p>
                <p><span class="goal-title">Next Goal:</span><br>${validateText(entry.nextGoal)}</p>
                <p><span class="goal-title">Goal Strategy:</span><br>${validateText(entry.goalStrategy)}</p>
            `;

            tr.innerHTML = `
                <td><b>${entry.name || 'N/A'}</b></td>
                <td>${entry.date || 'N/A'}</td>
                <td>${ratingsHTML}</td>
                <td style="text-align:center;font-weight:bold;font-size:1.4em;">${entry.growthScore || 'N/A'}</td>
                <td>${reflectionsHTML}</td>
            `;
            tbody.appendChild(tr);
        });

        // Show summary of data loaded
        console.log(`Loaded ${data.length} student reflections from localStorage`);
    }

    // Validate rating values
    function validateRating(rating) {
        if (rating === null || rating === undefined || rating === '') return '0';
        const num = parseInt(rating);
        return isNaN(num) || num < 0 || num > 5 ? '0' : num.toString();
    }

    // Validate text fields
    function validateText(text) {
        if (!text || text.trim() === '' || text === 'N/A') return 'N/A';
        return text.trim();
    }

    function exportToCsv() {
        const data = dataProcessor.loadData();
        if (data.length === 0) { 
            alert('No data to export.'); 
            return; 
        }

        const headers = ['Name', 'Date', 'Naming Emotions (Beginning)', 'Naming Emotions (Now)', 'Calming Down (Beginning)', 'Calming Down (Now)', 'Understanding Others (Beginning)', 'Understanding Others (Now)', 'Solving Conflicts (Beginning)', 'Solving Conflicts (Now)', 'Total Growth Score', 'Proudest Improvement', 'Success Story', 'Next Goal', 'Goal Strategy'];
        let csvContent = headers.join(',') + '\n';
        
        const escapeCsvCell = (cell) => {
            const strCell = String(cell === undefined || cell === null ? '' : cell);
            if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        };

        data.forEach(entry => {
            const row = [
                entry.name, 
                entry.date, 
                validateRating(entry.namingEmotions_B), 
                validateRating(entry.namingEmotions_N), 
                validateRating(entry.calming_B), 
                validateRating(entry.calming_N), 
                validateRating(entry.understandingOthers_B), 
                validateRating(entry.understandingOthers_N), 
                validateRating(entry.solvingConflicts_B), 
                validateRating(entry.solvingConflicts_N), 
                entry.growthScore, 
                validateText(entry.proudestImprovement), 
                validateText(entry.successStory), 
                validateText(entry.nextGoal), 
                validateText(entry.goalStrategy)
            ].map(escapeCsvCell).join(',');
            csvContent += row + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'student-reflections-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function clearData() {
        if (confirm('Are you sure you want to permanently delete ALL student reflection data?')) {
            localStorage.removeItem('selToolkit-selData');
            renderTable();
            const msgEl = document.getElementById('clear-msg');
            msgEl.textContent = 'All data cleared.';
            setTimeout(() => { msgEl.textContent = ''; }, 3000);
        }
    }

    document.getElementById('export-csv').addEventListener('click', exportToCsv);
    document.getElementById('clear-data').addEventListener('click', clearData);

    renderTable();
});