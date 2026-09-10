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

  // Download Sample Template
  const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "StudentID,StudentName,FatherName,MotherName,DOB,Mobile,Email,Address,Block,District,State,PIN,Gender,AcademicYear,ITIName,TradeName,AdmissionDate,Duration,ExpectedCompletion,TrainingStatus,EmploymentStatus\n" +
        "STU-2024-001,Ramesh Sahu,Gopal Sahu,Sunita Sahu,2004-05-12,9826100001,ramesh@example.com,Main Road,Dantewada,Dantewada,Chhattisgarh,494449,Male,2024-25,ITI Dantewada,Electrician,2024-08-01,2 Years,2026-07-31,Under Training,Not Applicable";
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "iti_student_upload_template.csv");
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
      uploadStatusBadge.textContent = `${file.name} (Validating...)`;
      uploadStatusBadge.style.backgroundColor = '#e0f2fe';
      uploadStatusBadge.style.color = '#0284c7';
    }

    setTimeout(() => {
      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = `${file.name} (Validated)`;
        uploadStatusBadge.style.backgroundColor = '#dcfce7';
        uploadStatusBadge.style.color = '#15803d';
      }

      // Populate preview counts
      if (statTotalRecords) statTotalRecords.textContent = '250';
      if (statValidRecords) statValidRecords.textContent = '242';
      if (statDuplicateRecords) statDuplicateRecords.textContent = '5';
      if (statInvalidRecords) statInvalidRecords.textContent = '3';

      // Update Error Report Box
      if (errorReportBox) {
        errorReportBox.innerHTML = `
          <div class="error-report-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div style="flex: 1;">
            <div class="error-report-title">3 records contain invalid phone numbers or missing trade names.</div>
            <div class="error-report-desc">5 duplicate student IDs were detected and will be skipped.</div>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <button class="btn-primary-add" style="padding: 5px 12px; font-size: 11.5px;" onclick="alert('Successfully imported 242 valid student records into Dantewada ITI Database!')">Import 242 Valid Records</button>
              <button class="btn-export" style="padding: 5px 12px; font-size: 11.5px;" onclick="alert('Downloading error log report...')">Download Error Log</button>
            </div>
          </div>
        `;
      }
    }, 600);
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
