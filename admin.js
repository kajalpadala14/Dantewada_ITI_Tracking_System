/**
 * Dantewada ITI Student Tracking System - Administration
 * Matching Screenshot media_1789018107885.png
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

  // State
  let currentTab = 'iti';

  // Data Store
  const itisData = [
    {
      id: 'ITI-01',
      name: 'Govt. ITI Dantewada',
      type: 'Government',
      block: 'Dantewada',
      district: 'Dantewada',
      contactPerson: 'R.K. Sharma (Principal)',
      contactNumber: '07856-252101',
      status: 'Active'
    },
    {
      id: 'ITI-02',
      name: 'Govt. ITI Geedam',
      type: 'Government',
      block: 'Geedam',
      district: 'Dantewada',
      contactPerson: 'A.K. Mandavi (TO)',
      contactNumber: '07856-252102',
      status: 'Active'
    },
    {
      id: 'ITI-03',
      name: 'Govt. ITI Katekalyan',
      type: 'Government',
      block: 'Katekalyan',
      district: 'Dantewada',
      contactPerson: 'S. Netam (Superintendent)',
      contactNumber: '07856-252103',
      status: 'Active'
    },
    {
      id: 'ITI-04',
      name: 'Govt. ITI Kuakonda',
      type: 'Government',
      block: 'Kuakonda',
      district: 'Dantewada',
      contactPerson: 'P. Sori (Principal)',
      contactNumber: '07856-252104',
      status: 'Active'
    }
  ];

  const yearsData = [
    { id: 'AY-2024', name: '2024-25', start: '01 Aug 2024', end: '31 Jul 2025', desc: 'Current Active Academic Session', status: 'Active' },
    { id: 'AY-2023', name: '2023-24', start: '01 Aug 2023', end: '31 Jul 2024', desc: 'Completed Session Records', status: 'Completed' },
    { id: 'AY-2022', name: '2022-23', start: '01 Aug 2022', end: '31 Jul 2023', desc: 'Archived Session Records', status: 'Completed' },
    { id: 'AY-2021', name: '2021-22', start: '01 Aug 2021', end: '31 Jul 2022', desc: 'Archived Session Records', status: 'Completed' }
  ];

  const tradesData = [
    { code: 'TRD-ELE', name: 'Electrician', type: 'Engineering', duration: '2 Years', itis: '4 ITIs', status: 'Active' },
    { code: 'TRD-FIT', name: 'Fitter', type: 'Engineering', duration: '2 Years', itis: '3 ITIs', status: 'Active' },
    { code: 'TRD-COP', name: 'COPA', type: 'Non-Engineering', duration: '1 Year', itis: '4 ITIs', status: 'Active' },
    { code: 'TRD-WEL', name: 'Welder', type: 'Engineering', duration: '1 Year', itis: '2 ITIs', status: 'Active' },
    { code: 'TRD-MEC', name: 'Mechanic Diesel', type: 'Engineering', duration: '1 Year', itis: '2 ITIs', status: 'Active' }
  ];

  const usersData = [
    { id: 'USR-001', name: 'Admin User', email: 'superadmin@cgiti.gov.in', role: 'Super Admin', branch: 'Directorate HQ', status: 'Active' },
    { id: 'USR-002', name: 'R.K. Sharma', email: 'iti.dantewada@cgiti.gov.in', role: 'Principal Officer', branch: 'Govt. ITI Dantewada', status: 'Active' },
    { id: 'USR-003', name: 'A.K. Mandavi', email: 'iti.geedam@cgiti.gov.in', role: 'Training Officer', branch: 'Govt. ITI Geedam', status: 'Active' },
    { id: 'USR-004', name: 'District Collector', email: 'collector.dantewada@cg.nic.in', role: 'District Nodal', branch: 'Collectorate Dantewada', status: 'Active' }
  ];

  // DOM Elements
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const btnAddItemText = document.getElementById('btnAddItemText');
  const btnAddAdminItem = document.getElementById('btnAddAdminItem');
  const adminTableTitle = document.getElementById('adminTableTitle');
  const adminTableSubtitle = document.getElementById('adminTableSubtitle');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminTableHead = document.getElementById('adminTableHead');
  const adminTableBody = document.getElementById('adminTableBody');

  // Modal Elements
  const adminModal = document.getElementById('adminModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const btnModalSave = document.getElementById('btnModalSave');
  const modalFormContainer = document.getElementById('modalFormContainer');

  function openModal(title, contentHtml) {
    if (!adminModal) return;
    modalTitle.textContent = title;
    modalFormContainer.innerHTML = contentHtml;
    adminModal.style.display = 'flex';
  }

  function closeModal() {
    if (!adminModal) return;
    adminModal.style.display = 'none';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) closeModal();
    });
  }

  if (btnModalSave) {
    btnModalSave.addEventListener('click', () => {
      alert('Record saved successfully!');
      closeModal();
    });
  }

  // Render Table depending on tab
  function renderCurrentTab(searchQuery = '') {
    const q = searchQuery.toLowerCase().trim();

    if (currentTab === 'iti') {
      btnAddItemText.textContent = '+ Add ITI';
      adminTableTitle.textContent = 'ITI Management';
      adminTableSubtitle.textContent = 'Manage approved district records and access';

      adminTableHead.innerHTML = `
        <tr>
          <th>ITI ID</th>
          <th>ITI NAME</th>
          <th>ITI TYPE</th>
          <th>BLOCK</th>
          <th>DISTRICT</th>
          <th>CONTACT PERSON</th>
          <th>CONTACT NUMBER</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      `;

      const filtered = itisData.filter(i =>
        i.id.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.block.toLowerCase().includes(q)
      );

      adminTableBody.innerHTML = filtered.map(item => `
        <tr>
          <td style="font-weight: 600; color: #0284c7; font-size: 13px;">${item.id}</td>
          <td style="font-weight: 500; font-size: 13px;">${item.name}</td>
          <td style="font-size: 13px; color: var(--text-muted);">${item.type}</td>
          <td style="font-size: 13px;">${item.block}</td>
          <td style="font-size: 13px;">${item.district}</td>
          <td style="font-size: 13px;">${item.contactPerson}</td>
          <td style="font-size: 13px;">${item.contactNumber}</td>
          <td>
            <span class="status-badge active">● ${item.status}</span>
          </td>
          <td>
            <button class="btn-icon-pencil" title="Edit ITI" onclick="editIti('${item.id}')">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');

    } else if (currentTab === 'year') {
      btnAddItemText.textContent = '+ Add Academic Year';
      adminTableTitle.textContent = 'Academic Year Management';
      adminTableSubtitle.textContent = 'Configure active sessions and session date intervals';

      adminTableHead.innerHTML = `
        <tr>
          <th>SESSION ID</th>
          <th>ACADEMIC YEAR</th>
          <th>START DATE</th>
          <th>END DATE</th>
          <th>DESCRIPTION</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      `;

      const filtered = yearsData.filter(y =>
        y.name.toLowerCase().includes(q) ||
        y.desc.toLowerCase().includes(q)
      );

      adminTableBody.innerHTML = filtered.map(item => `
        <tr>
          <td style="font-weight: 600; color: #0284c7; font-size: 13px;">${item.id}</td>
          <td style="font-weight: 600; font-size: 13px;">${item.name}</td>
          <td style="font-size: 13px;">${item.start}</td>
          <td style="font-size: 13px;">${item.end}</td>
          <td style="font-size: 13px; color: var(--text-muted);">${item.desc}</td>
          <td>
            <span class="status-badge ${item.status === 'Active' ? 'active' : 'completed'}">● ${item.status}</span>
          </td>
          <td>
            <button class="btn-icon-pencil" title="Edit Academic Year">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');

    } else if (currentTab === 'trade') {
      btnAddItemText.textContent = '+ Add Trade';
      adminTableTitle.textContent = 'Trade Management';
      adminTableSubtitle.textContent = 'Approved NCVT / SCVT vocational trades in district';

      adminTableHead.innerHTML = `
        <tr>
          <th>TRADE CODE</th>
          <th>TRADE NAME</th>
          <th>CATEGORY</th>
          <th>COURSE DURATION</th>
          <th>AFFILIATED ITIS</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      `;

      const filtered = tradesData.filter(t =>
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
      );

      adminTableBody.innerHTML = filtered.map(item => `
        <tr>
          <td style="font-weight: 600; color: #0284c7; font-size: 13px;">${item.code}</td>
          <td style="font-weight: 600; font-size: 13px;">${item.name}</td>
          <td style="font-size: 13px;">${item.type}</td>
          <td style="font-size: 13px;">${item.duration}</td>
          <td style="font-size: 13px; color: var(--text-muted);">${item.itis}</td>
          <td>
            <span class="status-badge active">● ${item.status}</span>
          </td>
          <td>
            <button class="btn-icon-pencil" title="Edit Trade">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');

    } else if (currentTab === 'user') {
      btnAddItemText.textContent = '+ Add User';
      adminTableTitle.textContent = 'User Management';
      adminTableSubtitle.textContent = 'Portal administrator and nodal authority credentials';

      adminTableHead.innerHTML = `
        <tr>
          <th>USER ID</th>
          <th>USER NAME</th>
          <th>EMAIL ADDRESS</th>
          <th>ROLE</th>
          <th>ASSIGNED ITI / OFFICE</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      `;

      const filtered = usersData.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );

      adminTableBody.innerHTML = filtered.map(item => `
        <tr>
          <td style="font-weight: 600; color: #0284c7; font-size: 13px;">${item.id}</td>
          <td style="font-weight: 600; font-size: 13px;">${item.name}</td>
          <td style="font-size: 13px; color: #0284c7;">${item.email}</td>
          <td style="font-size: 13px;">${item.role}</td>
          <td style="font-size: 13px; color: var(--text-muted);">${item.branch}</td>
          <td>
            <span class="status-badge active">● ${item.status}</span>
          </td>
          <td>
            <button class="btn-icon-pencil" title="Edit User">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Switch Tab Handler
  function switchTab(tabKey) {
    currentTab = tabKey;
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Also update sidebar active submenu state
    const subIti = document.getElementById('subIti');
    const subYear = document.getElementById('subYear');
    const subTrade = document.getElementById('subTrade');
    const subUser = document.getElementById('subUser');

    if (subIti) subIti.classList.toggle('active', tabKey === 'iti');
    if (subYear) subYear.classList.toggle('active', tabKey === 'year');
    if (subTrade) subTrade.classList.toggle('active', tabKey === 'trade');
    if (subUser) subUser.classList.toggle('active', tabKey === 'user');

    if (adminSearchInput) adminSearchInput.value = '';
    renderCurrentTab();
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Search input live filtering
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      renderCurrentTab(e.target.value);
    });
  }

  // Add Item Action
  if (btnAddAdminItem) {
    btnAddAdminItem.addEventListener('click', () => {
      if (currentTab === 'iti') {
        openModal('Add New Government ITI', `
          <div class="form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-field">
              <label class="form-label">ITI Code</label>
              <input type="text" class="form-input" placeholder="e.g. ITI-05" value="ITI-05">
            </div>
            <div class="form-field">
              <label class="form-label">ITI Name</label>
              <input type="text" class="form-input" placeholder="e.g. Govt. ITI Bacheli">
            </div>
            <div class="form-field">
              <label class="form-label">Block</label>
              <input type="text" class="form-input" placeholder="e.g. Bacheli">
            </div>
            <div class="form-field">
              <label class="form-label">District</label>
              <input type="text" class="form-input" value="Dantewada" readonly>
            </div>
            <div class="form-field">
              <label class="form-label">Principal / Contact Person</label>
              <input type="text" class="form-input" placeholder="Full name">
            </div>
            <div class="form-field">
              <label class="form-label">Phone Number</label>
              <input type="text" class="form-input" placeholder="07856-XXXXXX">
            </div>
          </div>
        `);
      } else if (currentTab === 'year') {
        openModal('Add Academic Session', `
          <div class="form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Academic Year</label>
              <input type="text" class="form-input" placeholder="e.g. 2025-26">
            </div>
            <div class="form-field">
              <label class="form-label">Session Status</label>
              <select class="form-select">
                <option>Active</option>
                <option>Upcoming</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Start Date</label>
              <input type="date" class="form-input" value="2025-08-01">
            </div>
            <div class="form-field">
              <label class="form-label">End Date</label>
              <input type="date" class="form-input" value="2026-07-31">
            </div>
          </div>
        `);
      } else if (currentTab === 'trade') {
        openModal('Add New Trade', `
          <div class="form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Trade Code</label>
              <input type="text" class="form-input" placeholder="e.g. TRD-ICT">
            </div>
            <div class="form-field">
              <label class="form-label">Trade Name</label>
              <input type="text" class="form-input" placeholder="e.g. ICTSM">
            </div>
            <div class="form-field">
              <label class="form-label">Category</label>
              <select class="form-select">
                <option>Engineering</option>
                <option>Non-Engineering</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Duration</label>
              <select class="form-select">
                <option>1 Year</option>
                <option>2 Years</option>
              </select>
            </div>
          </div>
        `);
      } else if (currentTab === 'user') {
        openModal('Add Portal Administrator', `
          <div class="form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="form-field">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" placeholder="Full name">
            </div>
            <div class="form-field">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" placeholder="user@cgiti.gov.in">
            </div>
            <div class="form-field">
              <label class="form-label">Role</label>
              <select class="form-select">
                <option>Super Admin</option>
                <option>Principal Officer</option>
                <option>Training Officer</option>
                <option>District Nodal</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Assigned ITI</label>
              <select class="form-select">
                <option>Directorate HQ</option>
                <option>Govt. ITI Dantewada</option>
                <option>Govt. ITI Geedam</option>
                <option>Govt. ITI Katekalyan</option>
                <option>Govt. ITI Kuakonda</option>
              </select>
            </div>
          </div>
        `);
      }
    });
  }

  // Window edit helper
  window.editIti = function(id) {
    const item = itisData.find(i => i.id === id);
    if (!item) return;

    openModal(`Edit ITI Details - ${item.name}`, `
      <div class="form-grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div class="form-field">
          <label class="form-label">ITI Code</label>
          <input type="text" class="form-input" value="${item.id}" readonly>
        </div>
        <div class="form-field">
          <label class="form-label">ITI Name</label>
          <input type="text" class="form-input" value="${item.name}">
        </div>
        <div class="form-field">
          <label class="form-label">Block</label>
          <input type="text" class="form-input" value="${item.block}">
        </div>
        <div class="form-field">
          <label class="form-label">District</label>
          <input type="text" class="form-input" value="${item.district}" readonly>
        </div>
        <div class="form-field">
          <label class="form-label">Contact Person</label>
          <input type="text" class="form-input" value="${item.contactPerson}">
        </div>
        <div class="form-field">
          <label class="form-label">Phone Number</label>
          <input type="text" class="form-input" value="${item.contactNumber}">
        </div>
      </div>
    `);
  };

  // URL query parameter routing (?tab=iti, ?tab=year, etc.)
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam && ['iti', 'year', 'trade', 'user'].includes(tabParam)) {
    switchTab(tabParam);
  } else {
    renderCurrentTab();
  }
});
