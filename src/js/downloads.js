/**
 * Dantewada ITI Student Tracking System - Download Center
 * Matching Screenshot media_1789017970554.png
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // Sidebar accordions
  const menuGroups = document.querySelectorAll('.menu-group');
  menuGroups.forEach(group => {
    const header = group.querySelector('.menu-item');
    if (header) {
      header.addEventListener('click', (e) => {
        if (!e.target.closest('.submenu')) {
          group.classList.toggle('open');
        }
      });
    }
  });

  // Dynamic Download Records (No hardcoded/dummy records)
  let downloadData = [];
  try {
    const local = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
    if (Array.isArray(local)) {
      downloadData = local.map(s => ({
        ...s,
        trainingBadgeClass: (s.trainingStatus === 'Passed') ? 'passed' : ((s.trainingStatus === 'Completed') ? 'completed' : 'under-training'),
        employmentBadgeClass: (s.employmentStatus === 'Employed') ? 'employed' : ((s.employmentStatus === 'Seeking Work') ? 'seeking-work' : 'not-applicable')
      }));
    }
  } catch (e) {
    downloadData = [];
  }

  const tableBody = document.getElementById('downloadsTableBody');
  const previewSubtext = document.getElementById('previewSubtext');
  const yearSelect = document.getElementById('exportYearSelect');
  const itiSelect = document.getElementById('exportItiSelect');
  const tradeSelect = document.getElementById('exportTradeSelect');
  const statusSelect = document.getElementById('exportStatusSelect');
  const btnPreviewData = document.getElementById('btnPreviewData');
  const btnResetExport = document.getElementById('btnResetExport');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnExcelCompatible = document.getElementById('btnExcelCompatible');

  let currentRecords = [...downloadData];

  function renderTable(records) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-muted);">
            No records found matching the selected export filters.
          </td>
        </tr>
      `;
      if (previewSubtext) {
        previewSubtext.textContent = 'Filtered sample preview • 0 records';
      }
      return;
    }

    records.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--text-heading); font-size: 13px;">${row.id}</td>
        <td style="font-weight: 500; font-size: 13px;">${row.name}</td>
        <td style="font-size: 13px;">${row.iti}</td>
        <td style="font-size: 13px;">${row.trade}</td>
        <td>
          <span class="status-badge ${row.trainingBadgeClass}">${row.trainingStatus}</span>
        </td>
        <td>
          <span class="status-badge ${row.employmentBadgeClass}">${row.employmentStatus}</span>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    if (previewSubtext) {
      previewSubtext.textContent = `Live data preview • ${records.length} records`;
    }
  }

  // Preview Data Filter
  function applyFilters() {
    const year = yearSelect ? yearSelect.value : 'All';
    const iti = itiSelect ? itiSelect.value : 'All';
    const trade = tradeSelect ? tradeSelect.value : 'All';
    const status = statusSelect ? statusSelect.value : 'All';

    currentRecords = downloadData.filter(item => {
      const matchYear = year === 'All' || item.year === year;
      const matchIti = iti === 'All' || item.iti === iti;
      const matchTrade = trade === 'All' || item.trade === trade;
      const matchStatus = status === 'All' || item.employmentStatus === status || item.trainingStatus === status;
      return matchYear && matchIti && matchTrade && matchStatus;
    });

    renderTable(currentRecords);
  }

  if (btnPreviewData) {
    btnPreviewData.addEventListener('click', applyFilters);
  }

  if (btnResetExport) {
    btnResetExport.addEventListener('click', () => {
      if (yearSelect) yearSelect.value = 'All';
      if (itiSelect) itiSelect.value = 'All';
      if (tradeSelect) tradeSelect.value = 'All';
      if (statusSelect) statusSelect.value = 'All';
      currentRecords = [...downloadData];
      renderTable(currentRecords);
    });
  }

  // Export CSV Functionality (Exact 24 Columns matching Student Registration sheet)
  function downloadCSV() {
    if (currentRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Student ID', 'Student Name', 'Father Name', 'Mother Name', 'Gender', 'Date of Birth',
      'Mobile Number', 'Alternate Mobile Number', 'Email ID', 'Address', 'Block', 'District',
      'State', 'PIN Code', 'Academic Year', 'ITI Name', 'Trade Name', 'Admission Date',
      'Course Duration', 'Expected Completion Date', 'Current Training Status',
      'Registration Number', 'ITI Roll Number', 'Government ID Reference Number'
    ];

    const rows = currentRecords.map(r => [
      `"${r.id || ''}"`,
      `"${r.name || ''}"`,
      `"${r.fatherName || ''}"`,
      `"${r.motherName || ''}"`,
      `"${r.gender || 'Male'}"`,
      `"${r.dob || ''}"`,
      `"${r.mobile || ''}"`,
      `"${r.altMobile || ''}"`,
      `"${r.email || ''}"`,
      `"${r.address || ''}"`,
      `"${r.block || ''}"`,
      `"${r.district || 'Dantewada'}"`,
      `"${r.state || 'Chhattisgarh'}"`,
      `"${r.pin || '494449'}"`,
      `"${r.year || '2024-25'}"`,
      `"${r.iti || ''}"`,
      `"${r.trade || ''}"`,
      `"${r.admissionDate || ''}"`,
      `"${r.duration || '2 Years'}"`,
      `"${r.expectedDate || ''}"`,
      `"${r.trainingStatus || 'Under Training'}"`,
      `"${r.regNumber || ''}"`,
      `"${r.rollNumber || ''}"`,
      `"${r.govId || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dantewada_ITI_Student_Registration_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (btnDownloadCsv) {
    btnDownloadCsv.addEventListener('click', downloadCSV);
  }

  if (btnExcelCompatible) {
    btnExcelCompatible.addEventListener('click', downloadCSV);
  }

  // Initial render
  renderTable(currentRecords);

  // Live fetch from Google Sheets
  if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchStudents === 'function') {
    GoogleSheetsService.fetchStudents().then(liveRows => {
      if (liveRows && liveRows.length > 0) {
        const studentMap = new Map();
        downloadData.forEach(s => studentMap.set(s.id, s));
        liveRows.forEach(s => {
          studentMap.set(s.id, {
            ...s,
            trainingBadgeClass: (s.trainingStatus === 'Passed') ? 'passed' : ((s.trainingStatus === 'Completed') ? 'completed' : 'under-training'),
            employmentBadgeClass: (s.employmentStatus === 'Employed') ? 'employed' : ((s.employmentStatus === 'Seeking Work') ? 'seeking-work' : 'not-applicable')
          });
        });
        downloadData = Array.from(studentMap.values());
        currentRecords = [...downloadData];
        renderTable(currentRecords);
      }
    }).catch(err => console.log('Downloads live fetch info:', err.message));
  }
});
