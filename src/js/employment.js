/* ==========================================================================
   DANTEWADA ITI EMPLOYMENT TRACKING - JAVASCRIPT
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

  // Baseline Employment Records
  const defaultEmploymentRecords = [
    {
      student: "Anita Markam",
      iti: "Govt. ITI Geedam",
      status: "Employed",
      type: "Private",
      company: "Shree Motors",
      role: "Technician",
      location: "Raipur",
      salary: "₹18,000–22,000",
      contact: "+91 94242 81903"
    },
    {
      student: "Vikas Yadav",
      iti: "Govt. ITI Dantewada",
      status: "Employed",
      type: "Private",
      company: "Bastar Auto Works",
      role: "Diesel Mechanic",
      location: "Jagdalpur",
      salary: "₹20,000–25,000",
      contact: "+91 94060 33812"
    },
    {
      student: "Manoj Singh",
      iti: "Govt. ITI Katekalyan",
      status: "Seeking Work",
      type: "—",
      company: "—",
      role: "—",
      location: "—",
      salary: "—",
      contact: "+91 79745 12098"
    },
    {
      student: "Pooja Kashyap",
      iti: "Govt. ITI Kuakonda",
      status: "Apprenticeship",
      type: "Government",
      company: "NMDC Kirandul",
      role: "Apprentice Trainee",
      location: "Kirandul",
      salary: "₹12,500 Stipend",
      contact: "+91 91114 55670"
    }
  ];

  let employmentRecords = [...defaultEmploymentRecords];
  try {
    const localEmp = JSON.parse(localStorage.getItem('iti_employment_records') || '[]');
    if (Array.isArray(localEmp) && localEmp.length > 0) {
      employmentRecords = localEmp;
    }
  } catch (e) {
    employmentRecords = [...defaultEmploymentRecords];
  }

  // Also include registered students from registry if they have employment status
  try {
    const localStudents = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
    localStudents.forEach(s => {
      if (s.employmentStatus && s.employmentStatus !== 'Not Applicable' && !employmentRecords.some(e => e.student === s.name)) {
        employmentRecords.unshift({
          student: s.name,
          iti: s.iti || 'Govt. ITI Dantewada',
          status: s.employmentStatus,
          type: 'Private',
          company: s.employmentStatus === 'Employed' ? 'Local Employer' : '—',
          role: s.trade ? `${s.trade} Technician` : 'Technician',
          location: 'Dantewada',
          salary: s.employmentStatus === 'Employed' ? '₹18,000–22,000' : '—',
          contact: s.mobile || '—'
        });
      }
    });
  } catch(e) {}

  const tableBody = document.getElementById('employmentTableBody');
  const searchInput = document.getElementById('empSearchInput');
  const statusFilter = document.getElementById('empStatusFilter');
  const itiFilter = document.getElementById('empItiFilter');
  const btnApplyFilter = document.getElementById('btnApplyFilter');

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #94a3b8;">No employment records found in Google Sheet. Update employment records or sync from your spreadsheet.</td></tr>`;
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
        <td>${item.type}</td>
        <td>${item.company}</td>
        <td>${item.role}</td>
        <td>${item.location}</td>
        <td>${item.salary}</td>
        <td class="text-right">
          <span class="link-action-text btn-view-emp" data-name="${item.student}">
            View record &rsaquo;
          </span>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // View record listener
    document.querySelectorAll('.btn-view-emp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentName = e.currentTarget.getAttribute('data-name');
        openEmpModal(studentName);
      });
    });
  }

  function filterData() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const status = statusFilter ? statusFilter.value : 'All';
    const iti = itiFilter ? itiFilter.value : 'All';

    const filtered = employmentRecords.filter(item => {
      const matchQuery = item.student.toLowerCase().includes(query) ||
                         item.company.toLowerCase().includes(query) ||
                         item.role.toLowerCase().includes(query);
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

  renderTable(employmentRecords);

  // Live fetch from Google Sheet (Employment Tracking Module tab)
  if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchEmployment === 'function') {
    GoogleSheetsService.fetchEmployment().then(liveEmp => {
      if (liveEmp && liveEmp.length > 0) {
        liveEmp.forEach(le => {
          if (le.company || le.role || le.status) {
            employmentRecords.unshift({
              student: le.role ? `${le.role} Candidate` : 'ITI Graduate',
              iti: 'Govt. ITI Dantewada',
              status: le.status || 'Employed',
              type: le.type || 'Private',
              company: le.company || '—',
              role: le.role || '—',
              location: le.location || '—',
              salary: le.salaryRange || '—',
              contact: '—'
            });
          }
        });
        filterData();
      }
    }).catch(err => console.log('Live Employment fetch info:', err.message));
  }

  // Update Employment button
  const btnUpdateEmployment = document.getElementById('btnUpdateEmployment');
  if (btnUpdateEmployment) {
    btnUpdateEmployment.addEventListener('click', async () => {
      const name = prompt("Enter Student Name to update employment status:");
      if (name) {
        const company = prompt("Enter Company / Employer Name:");
        if (company) {
          const role = prompt("Enter Job Role (e.g. Technician):") || "Technician";
          const salary = prompt("Enter Salary Range (e.g. ₹15,000–20,000):") || "—";
          const location = prompt("Enter Job Location:") || "—";
          const newRec = {
            student: name,
            iti: "Govt. ITI Dantewada",
            status: "Employed",
            type: "Private",
            company: company,
            role: role,
            location: location,
            salary: salary,
            contact: "—"
          };
          employmentRecords.unshift(newRec);
          try {
            localStorage.setItem('iti_employment_records', JSON.stringify(employmentRecords));
          } catch(e){}
          filterData();

          // Sync to Google Sheet (Employment Tracking Module)
          if (window.GoogleSheetsService && typeof GoogleSheetsService.submitEmployment === 'function') {
            await GoogleSheetsService.submitEmployment({
              status: 'Employed',
              type: 'Private',
              company: company,
              role: role || 'Technician',
              location: location || 'Kirandul',
              salaryRange: salary || '₹22,000',
              verificationStatus: 'Verified',
              lastFollowup: new Date().toISOString().slice(0, 10),
              remark: `Updated via Portal for ${name}`,
              privateJob: company
            });
          }

          alert(`Employment record updated for ${name} and queued/synced to Google Sheet!`);
        }
      }
    });
  }

  // Details Modal
  const empModal = document.getElementById('empModal');
  const empModalBody = document.getElementById('empModalBody');
  const empModalCloseBtn = document.getElementById('empModalCloseBtn');
  const empModalCloseFooterBtn = document.getElementById('empModalCloseFooterBtn');

  function openEmpModal(studentName) {
    const item = employmentRecords.find(r => r.student === studentName);
    if (!item || !empModalBody) return;

    empModalBody.innerHTML = `
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
        <span class="detail-label">Employment Type:</span>
        <span class="detail-value">${item.type}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Company / Employer:</span>
        <span class="detail-value">${item.company}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Designation / Role:</span>
        <span class="detail-value">${item.role}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Job Location:</span>
        <span class="detail-value">${item.location}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Monthly Salary Range:</span>
        <span class="detail-value">${item.salary}</span>
      </div>
      <div class="modal-detail-row">
        <span class="detail-label">Contact Number:</span>
        <span class="detail-value">${item.contact}</span>
      </div>
    `;

    if (empModal) empModal.classList.add('active');
  }

  function closeEmpModal() {
    if (empModal) empModal.classList.remove('active');
  }

  if (empModalCloseBtn) empModalCloseBtn.addEventListener('click', closeEmpModal);
  if (empModalCloseFooterBtn) empModalCloseFooterBtn.addEventListener('click', closeEmpModal);
  if (empModal) {
    empModal.addEventListener('click', (e) => {
      if (e.target === empModal) closeEmpModal();
    });
  }
});
