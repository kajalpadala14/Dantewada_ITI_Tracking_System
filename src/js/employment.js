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

  // Dataset from Reference Screenshot
  let employmentRecords = [
    {
      student: "Anita Markam",
      iti: "ITI Geedam",
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
      iti: "ITI Dantewada",
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
      iti: "ITI Katekalyan",
      status: "Seeking Work",
      type: "—",
      company: "—",
      role: "—",
      location: "—",
      salary: "—",
      contact: "+91 79745 12098"
    }
  ];

  const tableBody = document.getElementById('employmentTableBody');
  const searchInput = document.getElementById('empSearchInput');
  const statusFilter = document.getElementById('empStatusFilter');
  const itiFilter = document.getElementById('empItiFilter');
  const btnApplyFilter = document.getElementById('btnApplyFilter');

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 32px; color: #94a3b8;">No matching employment records found.</td></tr>`;
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

  // Update Employment button
  const btnUpdateEmployment = document.getElementById('btnUpdateEmployment');
  if (btnUpdateEmployment) {
    btnUpdateEmployment.addEventListener('click', () => {
      const name = prompt("Enter Student Name to update employment status:", "Anita Markam");
      if (name) {
        const company = prompt("Enter Company / Employer Name:", "NMDC Iron Ore");
        if (company) {
          const role = prompt("Enter Job Role:", "Plant Technician");
          const salary = prompt("Enter Salary Range:", "₹22,000–26,000");
          employmentRecords.unshift({
            student: name,
            iti: "ITI Dantewada",
            status: "Employed",
            type: "Private",
            company: company,
            role: role || "Technician",
            location: "Kirandul",
            salary: salary || "₹22,000",
            contact: "+91 98261 44102"
          });
          filterData();
          alert(`Employment record updated for ${name}!`);
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
