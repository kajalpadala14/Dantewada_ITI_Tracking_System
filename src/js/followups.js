/* ==========================================================================
   DANTEWADA ITI FOLLOW-UPS - JAVASCRIPT
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


  // Baseline Follow-ups Dataset
  const defaultFollowups = [
    {
      student: "Anita Markam",
      iti: "Govt. ITI Geedam",
      status: "Employed",
      lastFollowup: "18 Jun 2025",
      contactMode: "Phone",
      remarks: "Working steadily at Shree Motors",
      nextFollowup: "18 Sep 2025",
      phone: "+91 94242 81903",
      counselor: "R. K. Verma (Placement Officer)"
    },
    {
      student: "Manoj Singh",
      iti: "Govt. ITI Katekalyan",
      status: "Seeking Work",
      lastFollowup: "12 Jun 2025",
      contactMode: "WhatsApp",
      remarks: "Shared two openings in local industries",
      nextFollowup: "12 Jul 2025",
      phone: "+91 79745 12098",
      counselor: "P. Baghel (ITI Staff)"
    },
    {
      student: "Deepak Netam",
      iti: "Govt. ITI Katekalyan",
      status: "Seeking Work",
      lastFollowup: "05 Jun 2025",
      contactMode: "ITI Center",
      remarks: "Awaiting course certificate issuance",
      nextFollowup: "05 Jul 2025",
      phone: "+91 97531 65421",
      counselor: "S. K. Mandavi"
    }
  ];

  let followupsData = [...defaultFollowups];
  try {
    const local = JSON.parse(localStorage.getItem('iti_followups') || '[]');
    if (Array.isArray(local) && local.length > 0) followupsData = local;
  } catch(e) {
    followupsData = [...defaultFollowups];
  }

  const tableBody = document.getElementById('followupsTableBody');
  const searchInput = document.getElementById('followupSearchInput');
  const statusFilter = document.getElementById('followupStatusFilter');
  const itiFilter = document.getElementById('followupItiFilter');
  const btnApplyFilter = document.getElementById('btnApplyFollowupFilter');

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">No follow-up records found in Google Sheet.</td></tr>`;
      return;
    }

    data.forEach(item => {
      const badgeClass = item.status === 'Employed' ? 'employed' : 'seeking-work';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600; color: #0f172a;">${item.student}</td>
        <td>${item.iti}</td>
        <td>
          <span class="status-badge ${badgeClass}">${item.status}</span>
        </td>
        <td>${item.lastFollowup}</td>
        <td>${item.contactMode}</td>
        <td>${item.remarks}</td>
        <td>${item.nextFollowup}</td>
        <td class="text-right">
          <span class="link-action-text btn-view-followup" data-name="${item.student}">
            View details &rsaquo;
          </span>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.btn-view-followup').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentName = e.currentTarget.getAttribute('data-name');
        openFollowupModal(studentName);
      });
    });
  }

  function filterData() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const status = statusFilter ? statusFilter.value : 'All';
    const iti = itiFilter ? itiFilter.value : 'All';

    const filtered = followupsData.filter(item => {
      const matchQuery = item.student.toLowerCase().includes(query) ||
                         item.remarks.toLowerCase().includes(query) ||
                         item.contactMode.toLowerCase().includes(query);
      const matchStatus = (status === 'All') || (item.status === status);
      const matchIti = (iti === 'All') || (item.iti === iti);
      return matchQuery && matchStatus && matchIti;
    });

    renderTable(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterData);
  if (statusFilter) statusFilter.addEventListener('change', filterData);
  if (itiFilter) itiFilter.addEventListener('change', filterData);
  if (btnApplyFilter) btnApplyFilter.addEventListener('click', filterData);

  renderTable(followupsData);

  // Live fetch from Google Sheets
  if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchEmployment === 'function') {
    GoogleSheetsService.fetchEmployment().then(liveEmp => {
      if (liveEmp && liveEmp.length > 0) {
        liveEmp.forEach(le => {
          if (le.lastFollowup || le.remark || le.company) {
            followupsData.push({
              student: le.role ? `${le.role} Candidate` : 'ITI Graduate',
              iti: 'Govt. ITI Dantewada',
              status: le.status || 'Employed',
              lastFollowup: le.lastFollowup || '—',
              contactMode: 'Phone Call',
              remarks: le.remark || (le.company ? `Working at ${le.company}` : 'Follow-up logged'),
              nextFollowup: '—',
              phone: '—',
              counselor: 'Placement Cell'
            });
          }
        });
        filterData();
      }
    }).catch(err => console.log('Followups live fetch info:', err.message));
  }

  // Details Modal
  const modal = document.getElementById('followupModal');
  const modalBody = document.getElementById('followupModalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCloseFooterBtn = document.getElementById('modalCloseFooterBtn');

  function openFollowupModal(studentName) {
    const item = followupsData.find(r => r.student === studentName);
    if (!item || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-detail-row">
        <span class="detail-label">Student Name:</span>
        <span class="detail-value">${item.student}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">ITI Institution:</span>
        <span class="detail-value">${item.iti}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Employment Status:</span>
        <span class="status-badge ${item.status === 'Employed' ? 'employed' : 'seeking-work'}">${item.status}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Last Follow-Up Date:</span>
        <span class="detail-value">${item.lastFollowup}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Contact Mode:</span>
        <span class="detail-value">${item.contactMode}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Remarks / Action Taken:</span>
        <span class="detail-value">${item.remarks}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Scheduled Next Follow-Up:</span>
        <span class="detail-value" style="color: #1d70b8;">${item.nextFollowup}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Counselor / Officer:</span>
        <span class="detail-value">${item.counselor}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Student Mobile:</span>
        <span class="detail-value">${item.phone}</span>
      </div>
    `;

    if (modal) modal.classList.add('active');
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
});
