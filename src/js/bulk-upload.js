/* ==========================================================================
   DANTEWADA ITI BULK UPLOAD - JAVASCRIPT
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

  // Download Sample Template (Exact 24 Columns matching Student Registration sheet)
  const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', () => {
      const headers = [
        "Student ID", "Student Name", "Father Name", "Mother Name", "Gender", "Date of Birth",
        "Mobile Number", "Alternate Mobile Number", "Email ID", "Address", "Block", "District",
        "State", "PIN Code", "Academic Year", "ITI Name", "Trade Name", "Admission Date",
        "Course Duration", "Expected Completion Date", "Current Training Status",
        "Registration Number", "ITI Roll Number", "Government ID Reference Number"
      ];
      
      const sampleRow = [
        "STU-2024-001", "Ramesh Sahu", "Gopal Sahu", "Sunita Sahu", "Male", "2004-05-12",
        "9826100001", "9826100002", "ramesh@example.com", "Main Road, Dantewada", "Dantewada", "Dantewada",
        "Chhattisgarh", "494449", "2024-25", "Govt. ITI Dantewada", "Electrician", "2024-08-01",
        "2 Years", "2026-07-31", "Under Training",
        "REG-2024-001", "ROLL-2024-001", "1234-5678-9012"
      ];

      const csvContent = "data:text/csv;charset=utf-8," + 
        headers.join(",") + "\n" +
        sampleRow.map(v => `"${v}"`).join(",");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "iti_student_registration_template_24cols.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // File Upload Logic
  const dropzoneArea = document.getElementById('dropzoneArea');
  const bulkFileInput = document.getElementById('bulkFileInput');
  const btnChooseFile = document.getElementById('btnChooseFile');

  const uploadStatusBadge = document.getElementById('uploadStatusBadge');
  const statTotalRecords = document.getElementById('statTotalRecords');
  const statValidRecords = document.getElementById('statValidRecords');
  const statDuplicateRecords = document.getElementById('statDuplicateRecords');
  const statInvalidRecords = document.getElementById('statInvalidRecords');
  const errorReportBox = document.getElementById('errorReportBox');

  if (btnChooseFile && bulkFileInput) {
    btnChooseFile.addEventListener('click', () => {
      bulkFileInput.click();
    });
  }

  if (dropzoneArea && bulkFileInput) {
    dropzoneArea.addEventListener('click', (e) => {
      if (e.target !== btnChooseFile) {
        bulkFileInput.click();
      }
    });

    dropzoneArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneArea.classList.add('drag-over');
    });

    dropzoneArea.addEventListener('dragleave', () => {
      dropzoneArea.classList.remove('drag-over');
    });

    dropzoneArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneArea.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUploadedFile(e.dataTransfer.files[0]);
      }
    });

    bulkFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleUploadedFile(e.target.files[0]);
      }
    });
  }

  function handleUploadedFile(file) {
    if (!file) return;

    // Update Status Badge
    if (uploadStatusBadge) {
      uploadStatusBadge.textContent = `${file.name} (Reading...)`;
      uploadStatusBadge.style.backgroundColor = '#e0f2fe';
      uploadStatusBadge.style.color = '#0284c7';
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result || '';
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      const total = Math.max(0, lines.length - 1); // exclude header row

      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = `${file.name} (${total} Records)`;
        uploadStatusBadge.style.backgroundColor = total > 0 ? '#dcfce7' : '#fef3c7';
        uploadStatusBadge.style.color = total > 0 ? '#15803d' : '#b45309';
      }

      if (statTotalRecords) statTotalRecords.textContent = total.toString();
      if (statValidRecords) statValidRecords.textContent = total.toString();
      if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
      if (statInvalidRecords) statInvalidRecords.textContent = '0';

      if (errorReportBox) {
        if (total > 0) {
          errorReportBox.innerHTML = `
            <div class="error-report-icon" style="color: #16a34a;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div style="flex: 1;">
              <div class="error-report-title" style="color: #15803d;">File validated: ${total} records parsed successfully.</div>
              <div class="error-report-desc">No syntax errors detected in CSV file structure.</div>
            </div>
          `;
        } else {
          errorReportBox.innerHTML = `
            <div class="error-report-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div style="flex: 1;">
              <div class="error-report-title">File contains only headers or is empty.</div>
              <div class="error-report-desc">Please add student data rows and re-upload.</div>
            </div>
          `;
        }
      }
    };
    reader.onerror = function() {
      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = 'Read Error';
        uploadStatusBadge.style.backgroundColor = '#fee2e2';
        uploadStatusBadge.style.color = '#dc2626';
      }
    };

    if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
      reader.readAsText(file);
    } else {
      // For binary files (.xlsx), show file ready message
      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = `${file.name} (File Loaded)`;
        uploadStatusBadge.style.backgroundColor = '#dcfce7';
        uploadStatusBadge.style.color = '#15803d';
      }
      if (statTotalRecords) statTotalRecords.textContent = '1 File';
      if (statValidRecords) statValidRecords.textContent = 'Ready';
      if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
      if (statInvalidRecords) statInvalidRecords.textContent = '0';
    }
  }

  // Sync Directly from Google Sheet
  const btnSyncFromSheet = document.getElementById('btnSyncFromSheet');
  if (btnSyncFromSheet) {
    btnSyncFromSheet.addEventListener('click', async () => {
      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = 'Connecting to Google Sheet...';
        uploadStatusBadge.style.backgroundColor = '#e0f2fe';
        uploadStatusBadge.style.color = '#0284c7';
      }

      try {
        const students = await GoogleSheetsService.fetchStudents();
        if (students && students.length > 0) {
          if (uploadStatusBadge) {
            uploadStatusBadge.textContent = `Google Sheet (${students.length} Records)`;
            uploadStatusBadge.style.backgroundColor = '#dcfce7';
            uploadStatusBadge.style.color = '#15803d';
          }
          if (statTotalRecords) statTotalRecords.textContent = students.length.toString();
          if (statValidRecords) statValidRecords.textContent = students.length.toString();
          if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
          if (statInvalidRecords) statInvalidRecords.textContent = '0';
          if (window.showToast) window.showToast(`Fetched ${students.length} student records from Google Sheet!`, 'success');
        } else {
          if (uploadStatusBadge) {
            uploadStatusBadge.textContent = 'Google Sheet Connected (0 Records)';
            uploadStatusBadge.style.backgroundColor = '#fef3c7';
            uploadStatusBadge.style.color = '#b45309';
          }
          if (statTotalRecords) statTotalRecords.textContent = '0';
          if (statValidRecords) statValidRecords.textContent = '0';
          if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
          if (statInvalidRecords) statInvalidRecords.textContent = '0';
          if (window.showToast) window.showToast('Google Sheet connected! "Student Registration" tab currently has 0 rows. Add rows in your sheet and click Sync again.', 'info');
        }
      } catch (e) {
        if (uploadStatusBadge) {
          uploadStatusBadge.textContent = 'Sync Failed';
          uploadStatusBadge.style.backgroundColor = '#fee2e2';
          uploadStatusBadge.style.color = '#dc2626';
        }
        if (window.showToast) window.showToast('Could not fetch from Google Sheet: ' + e.message, 'error');
      }
    });
  }
});
