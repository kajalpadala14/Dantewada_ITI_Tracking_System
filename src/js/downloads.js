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

  // Sample Preview Data (Matching screenshot media_1789017970554.png)
  const downloadData = [
    {
      id: 'DW-2024-001',
      name: 'Rohit Kumar',
      iti: 'Govt. ITI Dantewada',
      trade: 'Fitter',
      year: '2024-25',
      trainingStatus: 'Under Training',
      trainingBadgeClass: 'under-training',
      employmentStatus: 'Not Applicable',
      employmentBadgeClass: 'not-applicable'
    },
    {
      id: 'GD-2023-254',
      name: 'Anita Markam',
      iti: 'Govt. ITI Geedam',
      trade: 'Electrician',
      year: '2023-24',
      trainingStatus: 'Passed',
      trainingBadgeClass: 'passed',
      employmentStatus: 'Employed',
      employmentBadgeClass: 'employed'
    },
    {
      id: 'KT-2022-032',
      name: 'Manoj Singh',
      iti: 'Govt. ITI Katekalyan',
      trade: 'Welder',
      year: '2022-23',
      trainingStatus: 'Completed',
      trainingBadgeClass: 'completed',
      employmentStatus: 'Seeking Work',
      employmentBadgeClass: 'seeking-work'
    },
    {
      id: 'KQ-2024-088',
      name: 'Sangeeta Mandavi',
      iti: 'Govt. ITI Kuakonda',
      trade: 'COPA',
      year: '2024-25',
      trainingStatus: 'Under Training',
      trainingBadgeClass: 'under-training',
      employmentStatus: 'Not Applicable',
      employmentBadgeClass: 'not-applicable'
    },
    {
      id: 'DW-2024-045',
      name: 'Pooja Kashyap',
      iti: 'Govt. ITI Dantewada',
      trade: 'COPA',
      year: '2024-25',
      trainingStatus: 'Passed',
      trainingBadgeClass: 'passed',
      employmentStatus: 'Employed',
      employmentBadgeClass: 'employed'
    },
    {
      id: 'GD-2023-102',
      name: 'Ramesh Netam',
      iti: 'Govt. ITI Geedam',
      trade: 'Mechanic Diesel',
      year: '2023-24',
      trainingStatus: 'Completed',
      trainingBadgeClass: 'completed',
      employmentStatus: 'Seeking Work',
      employmentBadgeClass: 'seeking-work'
    },
    {
      id: 'KT-2024-019',
      name: 'Sunil Poyam',
      iti: 'Govt. ITI Katekalyan',
      trade: 'Fitter',
      year: '2024-25',
      trainingStatus: 'Under Training',
      trainingBadgeClass: 'under-training',
      employmentStatus: 'Not Applicable',
      employmentBadgeClass: 'not-applicable'
    }
  ];

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
      previewSubtext.textContent = `Static sample preview • ${records.length} records`;
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

  // Export CSV Functionality
  function downloadCSV() {
    if (currentRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['STUDENT ID', 'STUDENT NAME', 'ITI', 'TRADE', 'TRAINING STATUS', 'EMPLOYMENT STATUS'];
    const rows = currentRecords.map(r => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.iti}"`,
      `"${r.trade}"`,
      `"${r.trainingStatus}"`,
      `"${r.employmentStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dantewada_ITI_Download_${new Date().toISOString().slice(0, 10)}.csv`);
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
});
