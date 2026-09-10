/**
 * Dantewada ITI Student Tracking System - Reports
 * Matching Screenshot media_1789017760309.png
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

  // Sample Preview Data (Matching screenshot media_1789017760309.png)
  const reportData = [
    {
      id: 'STU-2024-001',
      name: 'Rohit Kumar',
      iti: 'Govt. ITI Dantewada',
      trade: 'Electrician',
      year: '2024-25',
      trainingStatus: 'Completed',
      employmentStatus: 'Employed'
    },
    {
      id: 'STU-2024-002',
      name: 'Anita Markam',
      iti: 'Govt. ITI Dantewada',
      trade: 'COPA',
      year: '2024-25',
      trainingStatus: 'Under Training',
      employmentStatus: 'Seeking Work'
    },
    {
      id: 'STU-2024-003',
      name: 'Suresh Netam',
      iti: 'Govt. ITI Geedam',
      trade: 'Fitter',
      year: '2023-24',
      trainingStatus: 'Completed',
      employmentStatus: 'Employed'
    },
    {
      id: 'STU-2024-004',
      name: 'Priya Kashyap',
      iti: 'Govt. ITI Katekalyan',
      trade: 'Welder',
      year: '2023-24',
      trainingStatus: 'Completed',
      employmentStatus: 'Seeking Work'
    },
    {
      id: 'STU-2024-005',
      name: 'Manoj Baghel',
      iti: 'Govt. ITI Dantewada',
      trade: 'Electrician',
      year: '2024-25',
      trainingStatus: 'Under Training',
      employmentStatus: 'Under Training'
    },
    {
      id: 'STU-2024-006',
      name: 'Sunita Sori',
      iti: 'Govt. ITI Kuakonda',
      trade: 'COPA',
      year: '2022-23',
      trainingStatus: 'Completed',
      employmentStatus: 'Employed'
    },
    {
      id: 'STU-2024-007',
      name: 'Ramesh Poyam',
      iti: 'Govt. ITI Geedam',
      trade: 'Mechanic Diesel',
      year: '2023-24',
      trainingStatus: 'Completed',
      employmentStatus: 'Seeking Work'
    }
  ];

  const tableBody = document.getElementById('reportsTableBody');
  const previewSubtext = document.getElementById('previewSubtext');
  const yearSelect = document.getElementById('reportYearSelect');
  const itiSelect = document.getElementById('reportItiSelect');
  const tradeSelect = document.getElementById('reportTradeSelect');
  const statusSelect = document.getElementById('reportStatusSelect');
  const btnGenerateReport = document.getElementById('btnGenerateReport');
  const btnResetReport = document.getElementById('btnResetReport');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnExcelCompatible = document.getElementById('btnExcelCompatible');

  let currentRecords = [...reportData];

  function getBadgeClass(status) {
    switch (status) {
      case 'Completed':
      case 'Employed':
        return 'badge-completed';
      case 'Under Training':
        return 'badge-training';
      case 'Seeking Work':
        return 'badge-seeking';
      default:
        return 'badge-training';
    }
  }

  function renderTable(records) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-muted);">
            No records found matching the selected report filters.
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
          <span class="badge ${getBadgeClass(row.trainingStatus)}">${row.trainingStatus}</span>
        </td>
        <td>
          <span class="badge ${getBadgeClass(row.employmentStatus)}">${row.employmentStatus}</span>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    if (previewSubtext) {
      previewSubtext.textContent = `Static sample preview • ${records.length} records`;
    }
  }

  // Generate Report Filter
  function applyFilters() {
    const year = yearSelect ? yearSelect.value : 'All';
    const iti = itiSelect ? itiSelect.value : 'All';
    const trade = tradeSelect ? tradeSelect.value : 'All';
    const status = statusSelect ? statusSelect.value : 'All';

    currentRecords = reportData.filter(item => {
      const matchYear = year === 'All' || item.year === year;
      const matchIti = iti === 'All' || item.iti === iti;
      const matchTrade = trade === 'All' || item.trade === trade;
      const matchStatus = status === 'All' || item.employmentStatus === status;
      return matchYear && matchIti && matchTrade && matchStatus;
    });

    renderTable(currentRecords);
  }

  if (btnGenerateReport) {
    btnGenerateReport.addEventListener('click', () => {
      applyFilters();
    });
  }

  if (btnResetReport) {
    btnResetReport.addEventListener('click', () => {
      if (yearSelect) yearSelect.value = 'All';
      if (itiSelect) itiSelect.value = 'All';
      if (tradeSelect) tradeSelect.value = 'All';
      if (statusSelect) statusSelect.value = 'All';
      currentRecords = [...reportData];
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
    link.setAttribute('download', `Dantewada_ITI_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
