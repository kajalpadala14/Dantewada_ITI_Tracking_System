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

  // Collapsible Menu Groups
  document.querySelectorAll('.menu-group .menu-item').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.menu-group');
      if (parent) parent.classList.toggle('open');
    });
  });

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
        labels: ['ITI Dantewada', 'ITI Gidam', 'ITI Katekalyan', 'ITI Kuakonda'],
        datasets: [{
          label: 'Total Students',
          data: [942, 718, 564, 622],
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
            max: 1100,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: { stepSize: 200, color: '#64748b' }
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
      
      ctx.font = '700 22px ' + Chart.defaults.font.family;
      ctx.fillStyle = '#0f172a';
      ctx.fillText('982', centerX, centerY - 8);
      
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
        labels: ['Employed: 62.5%', 'Seeking work: 37.5%'],
        datasets: [{
          data: [614, 368],
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
          data: [420, 350, 260, 210],
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
          x: { beginAtZero: true, max: 500, grid: { color: '#f1f5f9' } },
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
          data: [1850, 2124, 2490, 2846],
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
            beginAtZero: false,
            min: 1500,
            max: 3100,
            grid: { color: '#f1f5f9' },
            ticks: { stepSize: 500, callback: (val) => val.toLocaleString() }
          }
        }
      },
      plugins: [trendPointLabelPlugin]
    });
  }

  // Academic Year Selector Filter in Dashboard
  const academicYearSelect = document.getElementById('academicYearSelect');
  if (academicYearSelect) {
    academicYearSelect.addEventListener('change', (e) => {
      const yr = e.target.value;
      const valTotal = document.getElementById('valTotalStudents');
      const valStudying = document.getElementById('valStudying');
      const valPassed = document.getElementById('valPassed');
      const valPlaced = document.getElementById('valPlaced');
      const valApprenticeship = document.getElementById('valApprenticeship');
      const valUntracked = document.getElementById('valUntracked');

      if (yr === '2024-25') {
        if (valTotal) valTotal.textContent = '2,846';
        if (valStudying) valStudying.textContent = '1,124';
        if (valPassed) valPassed.textContent = '982';
        if (valPlaced) valPlaced.textContent = '614';
        if (valApprenticeship) valApprenticeship.textContent = '368';
        if (valUntracked) valUntracked.textContent = '1,500';
        if (itiChartInstance) {
          itiChartInstance.data.datasets[0].data = [942, 718, 564, 622];
          itiChartInstance.update();
        }
      } else {
        if (valTotal) valTotal.textContent = '2,490';
        if (valStudying) valStudying.textContent = '980';
        if (valPassed) valPassed.textContent = '890';
        if (valPlaced) valPlaced.textContent = '540';
        if (valApprenticeship) valApprenticeship.textContent = '310';
        if (valUntracked) valUntracked.textContent = '1,280';
        if (itiChartInstance) {
          itiChartInstance.data.datasets[0].data = [820, 640, 500, 530];
          itiChartInstance.update();
        }
      }
    });
  }
});
