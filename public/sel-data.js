// File: sel-data.js
document.addEventListener('DOMContentLoaded', () => {
    function renderTable() {
        const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        const tbody = document.querySelector('#sel-data-table tbody');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;font-style:italic;padding:2em;">No data has been entered yet. Go to the dashboard to input student reflections.</td></tr>';
            return;
        }

        data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Show newest first

        data.forEach(entry => {
            const tr = document.createElement('tr');
            const ratingsHTML = `
                <p><b>Naming Emotions:</b> ${entry.namingEmotions_B || '0'} ➞ ${entry.namingEmotions_N || '0'}</p>
                <p><b>Calming Down:</b> ${entry.calming_B || '0'} ➞ ${entry.calming_N || '0'}</p>
                <p><b>Understanding Others:</b> ${entry.understandingOthers_B || '0'} ➞ ${entry.understandingOthers_N || '0'}</p>
                <p><b>Solving Conflicts:</b> ${entry.solvingConflicts_B || '0'} ➞ ${entry.solvingConflicts_N || '0'}</p>
            `;
            
            const reflectionsHTML = `
                <p><span class="goal-title">Proudest Improvement:</span><br>${entry.proudestImprovement || 'N/A'}</p>
                <p><span class="goal-title">Success Story:</span><br>${entry.successStory || 'N/A'}</p>
                <p><span class="goal-title">Next Goal:</span><br>${entry.nextGoal || 'N/A'}</p>
                <p><span class="goal-title">Goal Strategy:</span><br>${entry.goalStrategy || 'N/A'}</p>
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
    }

    function exportToCsv() {
        const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        if (data.length === 0) { alert('No data to export.'); return; }

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
            const row = [entry.name, entry.date, entry.namingEmotions_B, entry.namingEmotions_N, entry.calming_B, entry.calming_N, entry.understandingOthers_B, entry.understandingOthers_N, entry.solvingConflicts_B, entry.solvingConflicts_N, entry.growthScore, entry.proudestImprovement, entry.successStory, entry.nextGoal, entry.goalStrategy].map(escapeCsvCell).join(',');
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