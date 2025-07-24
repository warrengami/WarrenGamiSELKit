document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('observation-form');
    const tableBody = document.querySelector('#observation-log-table tbody');
    const exportBtn = document.getElementById('export-log');
    const filterStudent = document.getElementById('filter-student');
    const filterCompetency = document.getElementById('filter-competency');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const dateInput = document.getElementById('date-log');
    // Set today's date by default
    if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

    function getLog() {
        return JSON.parse(localStorage.getItem('selToolkit-observationLog') || '[]');
    }
    function saveLog(log) {
        localStorage.setItem('selToolkit-observationLog', JSON.stringify(log));
    }
    function renderTable() {
        const log = getLog();
        const student = filterStudent.value.trim().toLowerCase();
        const competency = filterCompetency.value;
        const from = filterDateFrom.value;
        const to = filterDateTo.value;
        tableBody.innerHTML = '';
        log.filter(entry => {
            if (student && !entry.student.toLowerCase().includes(student)) return false;
            if (competency && entry.competency !== competency) return false;
            if (from && entry.date < from) return false;
            if (to && entry.date > to) return false;
            return true;
        }).forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${entry.date}</td><td>${entry.student}</td><td>${entry.competency}</td><td>${entry.notes}</td>`;
            tableBody.appendChild(tr);
        });
    }
    form.onsubmit = function(e) {
        e.preventDefault();
        const log = getLog();
        log.push({
            date: dateInput.value,
            student: document.getElementById('student-name-log').value,
            competency: document.getElementById('competency-log').value,
            notes: document.getElementById('notes-log').value
        });
        saveLog(log);
        form.reset();
        dateInput.value = new Date().toISOString().slice(0,10);
        renderTable();
    };
    [filterStudent, filterCompetency, filterDateFrom, filterDateTo].forEach(el => el.oninput = renderTable);
    exportBtn.onclick = function() {
        const log = getLog();
        let csv = 'Date,Student,Competency,Notes\n';
        log.forEach(entry => {
            csv += `"${entry.date}","${entry.student}","${entry.competency}","${entry.notes.replace(/"/g,'""')}"\n`;
        });
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'observation-log.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    renderTable();
}); 