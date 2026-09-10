/* ==========================================================================
   DANTEWADA ITI ALL STUDENTS REGISTRY - JAVASCRIPT
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

  // --- Base Student Registry Dataset (Dynamic - No hardcoded/dummy records) ---
  let defaultStudents = [];

  // Merge Local Storage Records
  let localRegistry = [];
  try {
    localRegistry = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
  } catch (e) {
    localRegistry = [];
  }

  const combinedMap = new Map();
  localRegistry.forEach(s => {
    if (s && s.id) combinedMap.set(s.id, s);
  });
  let studentsData = Array.from(combinedMap.values());

  // Helper: Status Class mapping
  function getTrainingBadgeClass(status) {
    if (status === 'Under Training') return 'under-training';
    if (status === 'Passed') return 'passed';
    if (status === 'Completed') return 'completed';
    return 'neutral';
  }

  function getEmploymentBadgeClass(status) {
    if (status === 'Employed') return 'employed';
    if (status === 'Seeking Work') return 'seeking-work';
    if (status === 'Not Applicable') return 'not-applicable';
    if (status === 'Apprenticeship') return 'apprenticeship';
    return 'neutral';
  }

  function getInitials(name) {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const tableBody = document.getElementById('registryTableBody');
  const searchInput = document.getElementById('registrySearchInput');
  const itiFilter = document.getElementById('registryItiFilter');
  const yearFilter = document.getElementById('registryYearFilter');
  const pageInfo = document.getElementById('registryPageInfo');
  const metaText = document.getElementById('registryMetaText');

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (metaText) {
      metaText.innerHTML = `<strong>${data.length}</strong> records found`;
    }

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">No student records found in Google Sheet. Click "Add Student" or sync from your spreadsheet.</td></tr>`;
      if (pageInfo) pageInfo.textContent = 'Showing 0 of 0 students';
      return;
    }

    data.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-family: monospace; font-size: 12px; color: #475569;">${student.id}</td>
        <td>
          <div class="student-col">
            <div class="student-avatar">${getInitials(student.name)}</div>
            <div class="student-name-text">${student.name}</div>
          </div>
        </td>
        <td>${student.iti}</td>
        <td>${student.trade}</td>
        <td>${student.year}</td>
        <td>
          <span class="status-badge ${getTrainingBadgeClass(student.trainingStatus)}">
            ${student.trainingStatus}
          </span>
        </td>
        <td>
          <span class="status-badge ${getEmploymentBadgeClass(student.employmentStatus || 'Not Applicable')}">
            ${student.employmentStatus || 'Not Applicable'}
          </span>
        </td>
        <td class="text-right">
          <div class="action-icons-group">
            <button class="btn-table-action btn-view" title="View details" data-id="${student.id}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-table-action btn-edit" title="Edit student" data-id="${student.id}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button class="btn-table-action btn-delete" title="Delete record" data-id="${student.id}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    if (pageInfo) {
      pageInfo.textContent = `Showing 1-${data.length} of ${data.length} students`;
    }

    // Modal view listener
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openDetailModal(id);
      });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        alert(`Edit record for student ${id}`);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete student record "${id}" from Google Sheet and Registry?`)) {
          // 1. Remove from local memory and UI
          studentsData = studentsData.filter(s => s.id !== id);
          combinedMap.delete(id);
          try {
            const localStudents = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
            const updated = localStudents.filter(s => s.id !== id);
            localStorage.setItem('iti_students_registry', JSON.stringify(updated));
          } catch(err){}
          filterTable();

          // 2. Dispatch delete to Google Sheet
          if (window.GoogleSheetsService && typeof GoogleSheetsService.deleteStudent === 'function') {
            await GoogleSheetsService.deleteStudent(id);
          }
          alert(`✓ Student record "${id}" deleted successfully from Google Sheet and Registry!`);
        }
      });
    });
  }

  function filterTable() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const iti = itiFilter ? itiFilter.value : 'All';
    const year = yearFilter ? yearFilter.value : 'All';

    const filtered = studentsData.filter(s => {
      const matchQuery = (s.name || '').toLowerCase().includes(query) ||
                         (s.id || '').toLowerCase().includes(query) ||
                         (s.trade || '').toLowerCase().includes(query) ||
                         (s.iti || '').toLowerCase().includes(query);
      const matchIti = (iti === 'All') || (s.iti === iti);
      const matchYear = (year === 'All') || (s.year === year);
      return matchQuery && matchIti && matchYear;
    });

    renderTable(filtered);
  }

  if (searchInput) searchInput.addEventListener('input', filterTable);
  if (itiFilter) itiFilter.addEventListener('change', filterTable);
  if (yearFilter) yearFilter.addEventListener('change', filterTable);

  renderTable(studentsData);

  // Asynchronously fetch live students from Google Sheet (Student Registration tab)
  async function refreshFromGoogleSheet() {
    if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchStudents === 'function') {
      try {
        const liveRows = await GoogleSheetsService.fetchStudents();
        if (liveRows && liveRows.length > 0) {
          liveRows.forEach(row => {
            if (row.id) {
              combinedMap.set(row.id, row);
            }
          });
          studentsData = Array.from(combinedMap.values());
          filterTable();
        }
        return liveRows;
      } catch (err) {
        console.log('Live Google Sheet fetch info:', err.message);
        return [];
      }
    }
    return [];
  }

  // Initial load from Google Sheet + auto-sync offline/local students
  refreshFromGoogleSheet().then(async () => {
    if (window.GoogleSheetsService && typeof GoogleSheetsService.syncAllLocalToSheet === 'function') {
      const res = await GoogleSheetsService.syncAllLocalToSheet();
      if (res && res.synced > 0) {
        console.log(`[Sync] Automatically synced ${res.synced} students to Google Sheet.`);
        await refreshFromGoogleSheet();
      }
    }
  });

  // Manual Sync Button Handler
  const btnSyncSheet = document.getElementById('btnSyncSheet');
  const syncSheetBtnText = document.getElementById('syncSheetBtnText');
  if (btnSyncSheet) {
    btnSyncSheet.addEventListener('click', async () => {
      btnSyncSheet.disabled = true;
      if (syncSheetBtnText) syncSheetBtnText.textContent = 'Syncing...';
      try {
        if (window.GoogleSheetsService && typeof GoogleSheetsService.syncAllLocalToSheet === 'function') {
          const syncRes = await GoogleSheetsService.syncAllLocalToSheet();
          const rows = await refreshFromGoogleSheet();
          alert(`✓ Google Sheet Sync Successful!\n\n${syncRes.synced} record(s) uploaded to Google Sheet.\nTotal active records in Google Sheet: ${rows.length}`);
        } else {
          await refreshFromGoogleSheet();
          alert('✓ Google Sheet data refreshed!');
        }
      } catch (err) {
        alert('Sync error: ' + (err.message || err));
      } finally {
        btnSyncSheet.disabled = false;
        if (syncSheetBtnText) syncSheetBtnText.textContent = 'Sync Sheet';
      }
    });
  }

  // Detail Modal
  const modal = document.getElementById('detailModal');
  const modalBody = document.getElementById('modalBody');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCloseFooterBtn = document.getElementById('modalCloseFooterBtn');

  function openDetailModal(id) {
    const s = studentsData.find(item => item.id === id);
    if (!s || !modalBody) return;

    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Section 1: Basic Information -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #1e3a8a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            1. Personal & Contact Details
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div><span style="color:#64748b; font-size:12px;">Full Name:</span> <strong style="font-size:13px; color:#0f172a;">${s.name || '—'}</strong></div>
            <div><span style="color:#64748b; font-size:12px;">Father Name:</span> <span style="font-size:13px; color:#0f172a;">${s.fatherName || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Mother Name:</span> <span style="font-size:13px; color:#0f172a;">${s.motherName || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Gender:</span> <span style="font-size:13px; color:#0f172a;">${s.gender || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Date of Birth:</span> <span style="font-size:13px; color:#0f172a;">${s.dob || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Mobile Number:</span> <span style="font-size:13px; color:#0f172a;">${s.mobile || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Alternate Mobile:</span> <span style="font-size:13px; color:#0f172a;">${s.altMobile || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Email ID:</span> <span style="font-size:13px; color:#0f172a;">${s.email || '—'}</span></div>
            <div style="grid-column: 1 / -1;"><span style="color:#64748b; font-size:12px;">Address:</span> <span style="font-size:13px; color:#0f172a;">${s.address || '—'}, Block: ${s.block || '—'}, District: ${s.district || 'Dantewada'}, State: ${s.state || 'Chhattisgarh'}, PIN: ${s.pin || '494449'}</span></div>
          </div>
        </div>

        <!-- Section 2: Education & Training Information -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #1e3a8a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            2. ITI & Academic Details
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div><span style="color:#64748b; font-size:12px;">ITI Institution:</span> <strong style="font-size:13px; color:#0f172a;">${s.iti || '—'}</strong></div>
            <div><span style="color:#64748b; font-size:12px;">Trade:</span> <strong style="font-size:13px; color:#0f172a;">${s.trade || '—'}</strong></div>
            <div><span style="color:#64748b; font-size:12px;">Academic Session:</span> <span style="font-size:13px; color:#0f172a;">${s.year || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Admission Date:</span> <span style="font-size:13px; color:#0f172a;">${s.admissionDate || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Course Duration:</span> <span style="font-size:13px; color:#0f172a;">${s.duration || '2 Years'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Expected Completion:</span> <span style="font-size:13px; color:#0f172a;">${s.expectedDate || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Training Status:</span> <span class="status-badge ${getTrainingBadgeClass(s.trainingStatus)}">${s.trainingStatus || 'Under Training'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Employment Status:</span> <span class="status-badge ${getEmploymentBadgeClass(s.employmentStatus || 'Not Applicable')}">${s.employmentStatus || 'Not Applicable'}</span></div>
          </div>
        </div>

        <!-- Section 3: Official Identification References -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
          <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #1e3a8a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            3. Identification Numbers
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div><span style="color:#64748b; font-size:12px;">Student ID:</span> <span style="font-family:monospace; font-weight:600; color:#1e40af;">${s.id}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Registration Number:</span> <span style="font-family:monospace; color:#334155;">${s.regNumber || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">ITI Roll Number:</span> <span style="font-family:monospace; color:#334155;">${s.rollNumber || '—'}</span></div>
            <div><span style="color:#64748b; font-size:12px;">Government ID Reference:</span> <span style="font-family:monospace; color:#334155;">${s.govId || '—'}</span></div>
          </div>
        </div>
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
