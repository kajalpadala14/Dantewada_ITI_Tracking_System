/* ==========================================================================
   DANTEWADA ITI DASHBOARD - JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Drawer Toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => sidebar.classList.add('open'));
  }
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));
  }


  // Export Button
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      alert("Exporting Dantewada ITI Annual Summary Report (PDF/CSV)...");
    });
  }

  // ==========================================================================
  // CHART.JS ANALYTICS INITIALIZATION
  // ==========================================================================
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  Chart.defaults.color = '#64748b';

  // 1. ITI-wise Student Count (Vertical Bar Chart)
  const ctxIti = document.getElementById('itiCountChart');
  let itiChartInstance = null;

  const barTopLabelPlugin = {
    id: 'barTopLabel',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          ctx.save();
          ctx.font = '600 12px ' + Chart.defaults.font.family;
          ctx.fillStyle = '#1e293b';
          ctx.textAlign = 'center';
          ctx.fillText(val.toLocaleString(), bar.x, bar.y - 8);
          ctx.restore();
        });
      });
    }
  };

  if (ctxIti) {
    itiChartInstance = new Chart(ctxIti, {
      type: 'bar',
      data: {
        labels: ['Govt. ITI Dantewada', 'ITI Gidam', 'ITI Katekalyan', 'ITI Kuakonda'],
        datasets: [{
          label: 'Total Students',
          data: [0, 0, 0, 0],
          backgroundColor: '#1d70b8',
          hoverBackgroundColor: '#155e9b',
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 46
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            callbacks: {
              label: (item) => ` Enrolled: ${item.raw.toLocaleString()} students`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#475569', font: { size: 12, weight: '500' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { color: '#64748b' }
          }
        }
      },
      plugins: [barTopLabelPlugin]
    });
  }

  // 2. Employment Status (Donut Chart)
  const ctxDonut = document.getElementById('employmentDonutChart');
  let donutChartInstance = null;

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      if (chart.config.type !== 'doughnut') return;
      const meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data || !meta.data[0]) return;
      
      const { ctx } = chart;
      const centerX = meta.data[0].x;
      const centerY = meta.data[0].y;
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const totalDonut = (chart.data.datasets[0].data || []).reduce((a, b) => a + b, 0);
      ctx.font = '700 22px ' + Chart.defaults.font.family;
      ctx.fillStyle = '#0f172a';
      ctx.fillText(totalDonut.toString(), centerX, centerY - 8);
      
      ctx.font = '500 11px ' + Chart.defaults.font.family;
      ctx.fillStyle = '#64748b';
      ctx.fillText('students', centerX, centerY + 14);
      
      ctx.restore();
    }
  };

  if (ctxDonut) {
    donutChartInstance = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Employed: 0%', 'Seeking work: 0%'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#16a34a', '#f59e0b'],
          borderWidth: 2,
          borderColor: '#ffffff',
          cutout: '72%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'rect',
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              font: { size: 12, weight: '500' },
              color: '#334155'
            }
          }
        }
      },
      plugins: [centerTextPlugin]
    });
  }

  // 3. Trade-wise Student Count (Horizontal Bar Chart)
  const ctxTrade = document.getElementById('tradeChart');
  let tradeChartInstance = null;

  const barEndLabelPlugin = {
    id: 'barEndLabel',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          ctx.save();
          ctx.font = '600 12px ' + Chart.defaults.font.family;
          ctx.fillStyle = '#1e293b';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString(), bar.x + 8, bar.y);
          ctx.restore();
        });
      });
    }
  };

  if (ctxTrade) {
    tradeChartInstance = new Chart(ctxTrade, {
      type: 'bar',
      data: {
        labels: ['Electrician', 'Fitter', 'COPA', 'Welder'],
        datasets: [{
          label: 'Students',
          data: [0, 0, 0, 0],
          backgroundColor: '#0d9488',
          borderRadius: 3,
          barThickness: 10
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 35 } },
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          y: { grid: { display: false }, ticks: { color: '#334155', font: { size: 12, weight: '500' } } }
        }
      },
      plugins: [barEndLabelPlugin]
    });
  }

  // 4. Year-wise Student Trend
  const ctxTrend = document.getElementById('trendChart');
  let trendChartInstance = null;

  const trendPointLabelPlugin = {
    id: 'trendPointLabel',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((point, index) => {
          const val = dataset.data[index];
          ctx.save();
          ctx.font = '600 12px ' + Chart.defaults.font.family;
          ctx.fillStyle = '#0284c7';
          ctx.textAlign = 'center';
          ctx.fillText(val.toLocaleString(), point.x, point.y - 12);
          ctx.restore();
        });
      });
    }
  };

  if (ctxTrend) {
    trendChartInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: ['2021-22', '2022-23', '2023-24', '2024-25'],
        datasets: [{
          label: 'Total Enrolment',
          data: [0, 0, 0, 0],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0284c7',
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 22 } },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: (val) => val.toLocaleString() }
          }
        }
      },
      plugins: [trendPointLabelPlugin]
    });
  }

  // Dynamic Dataset & Metrics Calculation
  let allStudents = [];
  try {
    allStudents = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
  } catch(e) {
    allStudents = [];
  }

  function fmt(n) {
    return (n || 0).toLocaleString();
  }

  function updateDashboard(selectedYear = 'All') {
    const filtered = (selectedYear === 'All') 
      ? allStudents 
      : allStudents.filter(s => s.year === selectedYear);

    const totalStudents = filtered.length;
    const studyingCount = filtered.filter(s => s.trainingStatus === 'Under Training').length;
    const passedCount = filtered.filter(s => s.trainingStatus === 'Passed' || s.trainingStatus === 'Completed').length;
    const employedCount = filtered.filter(s => s.employmentStatus === 'Employed').length;
    const apprenticeshipCount = filtered.filter(s => s.employmentStatus === 'Apprenticeship').length;
    const untrackedCount = Math.max(0, totalStudents - (studyingCount + passedCount + employedCount + apprenticeshipCount));

    const valTotal = document.getElementById('valTotalStudents');
    const valStudying = document.getElementById('valStudying');
    const valPassed = document.getElementById('valPassed');
    const valPlaced = document.getElementById('valPlaced');
    const valApprenticeship = document.getElementById('valApprenticeship');
    const valUntracked = document.getElementById('valUntracked');

    if (valTotal) valTotal.textContent = fmt(totalStudents);
    if (valStudying) valStudying.textContent = fmt(studyingCount);
    if (valPassed) valPassed.textContent = fmt(passedCount);
    if (valPlaced) valPlaced.textContent = fmt(employedCount);
    if (valApprenticeship) valApprenticeship.textContent = fmt(apprenticeshipCount);
    if (valUntracked) valUntracked.textContent = fmt(untrackedCount);

    // Update ITI Bar Chart
    if (itiChartInstance) {
      const itis = ['Govt. ITI Dantewada', 'ITI Gidam', 'ITI Katekalyan', 'ITI Kuakonda'];
      const itiCounts = itis.map(itiName => {
        const needle = itiName.toLowerCase().replace('govt. ', '').trim();
        return filtered.filter(s => (s.iti || '').toLowerCase().includes(needle)).length;
      });
      itiChartInstance.data.datasets[0].data = itiCounts;
      const maxCount = Math.max(...itiCounts, 10);
      itiChartInstance.options.scales.y.max = Math.ceil(maxCount * 1.2);
      itiChartInstance.update();
    }

    // Update Employment Donut Chart
    if (donutChartInstance) {
      const seekingCount = filtered.filter(s => s.employmentStatus === 'Seeking Work').length;
      const totalEmpReported = employedCount + seekingCount;
      const empPercent = totalEmpReported > 0 ? Math.round((employedCount / totalEmpReported) * 100) : 0;
      const seekPercent = totalEmpReported > 0 ? (100 - empPercent) : 0;

      donutChartInstance.data.labels = [
        `Employed: ${empPercent}%`,
        `Seeking work: ${seekPercent}%`
      ];
      donutChartInstance.data.datasets[0].data = [employedCount, seekingCount];
      donutChartInstance.update();
    }

    // Update Trade Chart
    if (tradeChartInstance) {
      const trades = ['Electrician', 'Fitter', 'COPA', 'Welder'];
      const tradeCounts = trades.map(t => filtered.filter(s => (s.trade || '').toLowerCase().includes(t.toLowerCase())).length);
      tradeChartInstance.data.datasets[0].data = tradeCounts;
      const maxTrade = Math.max(...tradeCounts, 10);
      tradeChartInstance.options.scales.x.max = Math.ceil(maxTrade * 1.2);
      tradeChartInstance.update();
    }

    // Update Year-wise Trend Chart
    if (trendChartInstance) {
      const years = ['2021-22', '2022-23', '2023-24', '2024-25'];
      const yearCounts = years.map(yr => allStudents.filter(s => s.year === yr).length);
      trendChartInstance.data.datasets[0].data = yearCounts;
      const maxYear = Math.max(...yearCounts, 10);
      trendChartInstance.options.scales.y.max = Math.ceil(maxYear * 1.2);
      trendChartInstance.update();
    }
  }

  // Academic Year Selector Filter in Dashboard
  const academicYearSelect = document.getElementById('academicYearSelect');
  if (academicYearSelect) {
    academicYearSelect.addEventListener('change', (e) => {
      updateDashboard(e.target.value);
    });
  }

  // Initial render with stored/empty state
  updateDashboard(academicYearSelect ? academicYearSelect.value : 'All');

  // Fetch live student data from Google Sheets and re-render dashboard
  if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchStudents === 'function') {
    GoogleSheetsService.fetchStudents().then(liveRows => {
      if (liveRows && liveRows.length > 0) {
        const studentMap = new Map();
        allStudents.forEach(s => studentMap.set(s.id, s));
        liveRows.forEach(s => studentMap.set(s.id, s));
        allStudents = Array.from(studentMap.values());
        updateDashboard(academicYearSelect ? academicYearSelect.value : 'All');
      }
    }).catch(err => console.log('Dashboard live fetch info:', err.message));
  }
});
