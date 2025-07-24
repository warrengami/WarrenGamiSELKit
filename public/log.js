document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('observation-form');
    const tableBody = document.querySelector('#observation-log-table tbody');
    const exportBtn = document.getElementById('export-log');
    const filterStudent = document.getElementById('filter-student');
    const filterCompetency = document.getElementById('filter-competency');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const dateInput = document.getElementById('date-log');
    const studentNameSelect = document.getElementById('student-name-log');
    const studentNameOther = document.getElementById('student-name-log-other');
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

    function getUniqueStudentNames() {
        const data = JSON.parse(localStorage.getItem('selToolkit-selData') || '[]');
        const names = data.map(entry => entry.name && entry.name.trim()).filter(Boolean);
        return Array.from(new Set(names)).sort();
    }

    function populateStudentDropdown() {
        if (!studentNameSelect) return;
        // Remove all except first and last (Other...)
        while (studentNameSelect.options.length > 2) studentNameSelect.remove(1);
        const names = getUniqueStudentNames();
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            studentNameSelect.insertBefore(opt, studentNameSelect.options[studentNameSelect.options.length-1]);
        });
    }

    if (studentNameSelect && studentNameOther) {
        populateStudentDropdown();
        studentNameSelect.onchange = function() {
            if (studentNameSelect.value === '__other__') {
                studentNameOther.style.display = '';
                studentNameOther.required = true;
            } else {
                studentNameOther.style.display = 'none';
                studentNameOther.required = false;
            }
        };
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        const log = getLog();
        let studentName = studentNameSelect.value;
        if (studentName === '__other__') {
            studentName = studentNameOther.value.trim();
        }
        log.push({
            date: dateInput.value,
            student: studentName,
            competency: document.getElementById('competency-log').value,
            notes: document.getElementById('notes-log').value
        });
        saveLog(log);
        form.reset();
        dateInput.value = new Date().toISOString().slice(0,10);
        renderTable();
        populateStudentDropdown(); // Refresh in case a new name was added
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