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


  // Standard 24 Columns
  const EXPECTED_HEADERS = [
    "Student ID", "Student Name", "Father Name", "Mother Name", "Gender", "Date of Birth",
    "Mobile Number", "Alternate Mobile Number", "Email ID", "Address", "Block", "District",
    "State", "PIN Code", "Academic Year", "ITI Name", "Trade Name", "Admission Date",
    "Course Duration", "Expected Completion Date", "Current Training Status",
    "Registration Number", "ITI Roll Number", "Government ID Reference Number"
  ];

  // Download Sample Template (Exact 24 Columns matching Student Registration sheet)
  const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', () => {
      const sampleRow = [
        "STU-2024-001", "Ramesh Sahu", "Gopal Sahu", "Sunita Sahu", "Male", "2004-05-12",
        "9826100001", "9826100002", "ramesh@example.com", "Main Road, Dantewada", "Dantewada", "Dantewada",
        "Chhattisgarh", "494449", "2024-25", "Govt. ITI Dantewada", "Electrician", "2024-08-01",
        "2 Years", "2026-07-31", "Under Training",
        "REG-2024-001", "ROLL-2024-001", "1234-5678-9012"
      ];

      const csvContent = "data:text/csv;charset=utf-8," + 
        EXPECTED_HEADERS.join(",") + "\n" +
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

  // DOM Elements
  const dropzoneArea = document.getElementById('dropzoneArea');
  const bulkFileInput = document.getElementById('bulkFileInput');
  const btnChooseFile = document.getElementById('btnChooseFile');

  const uploadStatusBadge = document.getElementById('uploadStatusBadge');
  const statTotalRecords = document.getElementById('statTotalRecords');
  const statValidRecords = document.getElementById('statValidRecords');
  const statDuplicateRecords = document.getElementById('statDuplicateRecords');
  const statInvalidRecords = document.getElementById('statInvalidRecords');
  const errorReportBox = document.getElementById('errorReportBox');

  const btnImportRecords = document.getElementById('btnImportRecords');
  const importBtnText = document.getElementById('importBtnText');
  const btnDownloadErrors = document.getElementById('btnDownloadErrors');

  // In-memory state for the active file upload
  let parsedValidRecords = [];
  let parsedDuplicateRecords = [];
  let parsedInvalidRecords = [];
  let parsedErrorsList = []; // { rowNumber, studentId, studentName, mobile, type, reason }

  if (btnChooseFile && bulkFileInput) {
    btnChooseFile.addEventListener('click', (e) => {
      e.stopPropagation();
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

  // RFC 4180 CSV Parser
  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }
    return rows;
  }

  // XLSX Parser using SheetJS
  function parseXLSX(file) {
    return new Promise((resolve, reject) => {
      if (typeof XLSX === 'undefined') {
        reject(new Error('Excel parser library is still loading. Please try again in a few seconds or use CSV.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            reject(new Error('Excel file contains no sheets.'));
            return;
          }
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          const cleanRows = rows
            .map(r => Array.isArray(r) ? r.map(c => c == null ? '' : String(c).trim()) : [])
            .filter(r => r.some(c => c.length > 0));
          resolve(cleanRows);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Could not read the Excel file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Candidate column headers mapping
  const FIELD_MAP = {
    id: ['student id', 'studentid', 'id', 'stu id', 'admission id'],
    name: ['student name', 'studentname', 'name', 'trainee name', 'candidate name'],
    fatherName: ['father name', 'fathername', "father's name", 'fathers name'],
    motherName: ['mother name', 'mothername', "mother's name", 'mothers name'],
    gender: ['gender', 'sex'],
    dob: ['date of birth', 'dateofbirth', 'dob'],
    mobile: ['mobile number', 'mobilenumber', 'mobile', 'phone', 'contact', 'phone number'],
    altMobile: ['alternate mobile number', 'alternate mobile', 'alt mobile', 'altmobile', 'emergency contact'],
    email: ['email id', 'email', 'email address'],
    address: ['address', 'residence address', 'residential address'],
    block: ['block', 'tahsil', 'tehsil'],
    district: ['district', 'dist'],
    state: ['state'],
    pin: ['pin code', 'pincode', 'pin', 'postal code'],
    year: ['academic year', 'academin year', 'year', 'session', 'batch', 'academic session'],
    iti: ['iti name', 'itiname', 'iti', 'institute name', 'institution'],
    trade: ['trade name', 'tradename', 'trade', 'course', 'vocational trade'],
    admissionDate: ['admission date', 'admissiondate', 'date of admission'],
    duration: ['course duration', 'duration'],
    expectedDate: ['expected completion date', 'expected completion', 'completion date'],
    trainingStatus: ['current training status', 'training status', 'status'],
    regNumber: ['registration number', 'reg number', 'regno', 'registration no'],
    rollNumber: ['iti roll number', 'roll number', 'rollno', 'roll no'],
    govId: ['government id reference number', 'govt id', 'aadhar', 'aadhaar', 'id ref']
  };

  function sanitizeField(val, fallback = '') {
    let str = (val == null ? fallback : String(val)).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return str;
  }

  async function handleUploadedFile(file) {
    if (!file) return;

    // Reset State
    parsedValidRecords = [];
    parsedDuplicateRecords = [];
    parsedInvalidRecords = [];
    parsedErrorsList = [];
    updateActionButtons();

    if (uploadStatusBadge) {
      uploadStatusBadge.textContent = `${file.name} (Processing...)`;
      uploadStatusBadge.style.backgroundColor = '#e0f2fe';
      uploadStatusBadge.style.color = '#0284c7';
    }

    try {
      let rawRows = [];
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel');

      if (isExcel) {
        rawRows = await parseXLSX(file);
      } else {
        const textContent = await file.text();
        rawRows = parseCSV(textContent);
      }

      if (!rawRows || rawRows.length === 0) {
        showEmptyFileError(file.name);
        return;
      }

      // First row is headers
      const headerRow = rawRows[0].map(h => String(h).trim().toLowerCase());
      const dataRows = rawRows.slice(1);

      if (dataRows.length === 0) {
        showEmptyDataError(file.name);
        return;
      }

      // Map column indexes
      const colIndexMap = {};
      for (const [fieldKey, candidateNames] of Object.entries(FIELD_MAP)) {
        colIndexMap[fieldKey] = headerRow.findIndex(h => candidateNames.includes(h));
      }

      // If neither 'name' nor 'mobile' column found, check if header matches standard order
      if (colIndexMap.name === -1 && colIndexMap.mobile === -1) {
        // Fallback positional indexing if file matches standard template
        colIndexMap.id = 0;
        colIndexMap.name = 1;
        colIndexMap.fatherName = 2;
        colIndexMap.motherName = 3;
        colIndexMap.gender = 4;
        colIndexMap.dob = 5;
        colIndexMap.mobile = 6;
        colIndexMap.altMobile = 7;
        colIndexMap.email = 8;
        colIndexMap.address = 9;
        colIndexMap.block = 10;
        colIndexMap.district = 11;
        colIndexMap.state = 12;
        colIndexMap.pin = 13;
        colIndexMap.year = 14;
        colIndexMap.iti = 15;
        colIndexMap.trade = 16;
        colIndexMap.admissionDate = 17;
        colIndexMap.duration = 18;
        colIndexMap.expectedDate = 19;
        colIndexMap.trainingStatus = 20;
        colIndexMap.regNumber = 21;
        colIndexMap.rollNumber = 22;
        colIndexMap.govId = 23;
      }

      // Load existing registry from localStorage for duplicate detection
      let existingRegistry = [];
      try {
        existingRegistry = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
      } catch (err) {
        existingRegistry = [];
      }

      const existingIds = new Set();
      const existingMobiles = new Set();
      existingRegistry.forEach(s => {
        if (s) {
          if (s.id) existingIds.add(String(s.id).trim().toLowerCase());
          if (s.mobile) existingMobiles.add(String(s.mobile).replace(/\D/g, ''));
        }
      });

      const seenIdsInFile = new Set();
      const seenMobilesInFile = new Set();

      let autoIdSeq = 1;
      const currentYear = new Date().getFullYear();

      // Process each row
      dataRows.forEach((row, idx) => {
        const rowNum = idx + 2; // +1 for 0-index, +1 for header row
        
        function getVal(key, fallback = '') {
          const cIdx = colIndexMap[key];
          if (cIdx !== undefined && cIdx >= 0 && row[cIdx] !== undefined) {
            return sanitizeField(row[cIdx], fallback);
          }
          return fallback;
        }

        let studentId = getVal('id');
        const name = getVal('name');
        const fatherName = getVal('fatherName');
        const motherName = getVal('motherName');
        const gender = getVal('gender', 'Male');
        const dob = getVal('dob');
        let mobile = getVal('mobile').replace(/\D/g, '');
        const altMobile = getVal('altMobile').replace(/\D/g, '');
        const email = getVal('email');
        const address = getVal('address');
        const block = getVal('block');
        const district = getVal('district', 'Dantewada');
        const state = getVal('state', 'Chhattisgarh');
        const pin = getVal('pin', '494449');
        const year = getVal('year', '2024-25');
        const iti = getVal('iti', 'Govt. ITI Dantewada');
        const trade = getVal('trade');
        const admissionDate = getVal('admissionDate');
        const duration = getVal('duration', '2 Years');
        const expectedDate = getVal('expectedDate');
        const trainingStatus = getVal('trainingStatus', 'Under Training');
        const regNumber = getVal('regNumber');
        const rollNumber = getVal('rollNumber');
        const govId = getVal('govId');

        // Validation Checks
        const invalidReasons = [];
        const duplicateReasons = [];

        if (!name || name.length < 2) {
          invalidReasons.push('Student Name is missing or too short');
        }

        if (!mobile) {
          invalidReasons.push('Mobile Number is required');
        } else if (!/^[6-9]\d{9}$/.test(mobile)) {
          invalidReasons.push(`Invalid 10-digit mobile number: "${mobile}" (must be 10 digits starting with 6-9)`);
        }

        if (altMobile && !/^[6-9]\d{9}$/.test(altMobile)) {
          invalidReasons.push(`Invalid Alternate Mobile: "${altMobile}" (must be 10 digits starting with 6-9)`);
        }

        if (!trade) {
          invalidReasons.push('Trade Name is required');
        }

        if (!year) {
          invalidReasons.push('Academic Year is required');
        }

        // If ID is missing, auto-generate temporary sequential ID
        if (!studentId) {
          studentId = `STU-${currentYear}-B${String(autoIdSeq++).padStart(3, '0')}`;
        }

        const lowerId = studentId.toLowerCase();

        // Duplicate Detection: Check within file
        if (seenIdsInFile.has(lowerId)) {
          duplicateReasons.push(`Duplicate Student ID "${studentId}" in uploaded file`);
        }
        if (mobile && seenMobilesInFile.has(mobile)) {
          duplicateReasons.push(`Duplicate Mobile Number "${mobile}" in uploaded file`);
        }

        // Duplicate Detection: Check against existing registry
        if (existingIds.has(lowerId)) {
          duplicateReasons.push(`Student ID "${studentId}" already exists in system registry`);
        }
        if (mobile && existingMobiles.has(mobile)) {
          duplicateReasons.push(`Mobile Number "${mobile}" already registered for another student`);
        }

        const studentObj = {
          id: studentId,
          name,
          fatherName,
          motherName,
          gender,
          dob,
          mobile,
          altMobile,
          email,
          address,
          block: block || 'Dantewada',
          district,
          state,
          pin,
          year,
          iti,
          trade,
          admissionDate,
          duration,
          expectedDate,
          trainingStatus,
          employmentStatus: 'Not Applicable',
          regNumber,
          rollNumber,
          govId,
          updated: 'Imported via Bulk Upload'
        };

        if (invalidReasons.length > 0) {
          parsedInvalidRecords.push(studentObj);
          parsedErrorsList.push({
            rowNumber: rowNum,
            studentId,
            studentName: name || '—',
            mobile: mobile || '—',
            type: 'Invalid Record',
            reason: invalidReasons.join('; ')
          });
        } else if (duplicateReasons.length > 0) {
          parsedDuplicateRecords.push(studentObj);
          parsedErrorsList.push({
            rowNumber: rowNum,
            studentId,
            studentName: name || '—',
            mobile: mobile || '—',
            type: 'Duplicate Record',
            reason: duplicateReasons.join('; ')
          });
        } else {
          // Valid Record
          seenIdsInFile.add(lowerId);
          if (mobile) seenMobilesInFile.add(mobile);
          parsedValidRecords.push(studentObj);
        }
      });

      // Update Summary Numbers
      const total = dataRows.length;
      if (statTotalRecords) statTotalRecords.textContent = total.toString();
      if (statValidRecords) statValidRecords.textContent = parsedValidRecords.length.toString();
      if (statDuplicateRecords) statDuplicateRecords.textContent = parsedDuplicateRecords.length.toString();
      if (statInvalidRecords) statInvalidRecords.textContent = parsedInvalidRecords.length.toString();

      // Update Status Badge
      if (uploadStatusBadge) {
        if (parsedInvalidRecords.length === 0 && parsedDuplicateRecords.length === 0) {
          uploadStatusBadge.textContent = `${file.name} (${parsedValidRecords.length} Valid)`;
          uploadStatusBadge.style.backgroundColor = '#dcfce7';
          uploadStatusBadge.style.color = '#15803d';
        } else if (parsedValidRecords.length > 0) {
          uploadStatusBadge.textContent = `${file.name} (${parsedValidRecords.length} Valid, ${parsedInvalidRecords.length + parsedDuplicateRecords.length} Issues)`;
          uploadStatusBadge.style.backgroundColor = '#fef3c7';
          uploadStatusBadge.style.color = '#b45309';
        } else {
          uploadStatusBadge.textContent = `${file.name} (Validation Failed)`;
          uploadStatusBadge.style.backgroundColor = '#fee2e2';
          uploadStatusBadge.style.color = '#dc2626';
        }
      }

      // Update Error Report Card UI
      renderErrorReportBox(total);
      updateActionButtons();

    } catch (err) {
      console.error('File parsing error:', err);
      if (uploadStatusBadge) {
        uploadStatusBadge.textContent = 'Upload Error';
        uploadStatusBadge.style.backgroundColor = '#fee2e2';
        uploadStatusBadge.style.color = '#dc2626';
      }
      if (errorReportBox) {
        errorReportBox.innerHTML = `
          <div class="error-report-icon" style="color: #dc2626;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div style="flex: 1;">
            <div class="error-report-title" style="color: #b91c1c;">File processing failed</div>
            <div class="error-report-desc">${escapeHtml(err.message || 'Unknown error occurred while parsing file.')}</div>
          </div>
        `;
      }
      if (statTotalRecords) statTotalRecords.textContent = '0';
      if (statValidRecords) statValidRecords.textContent = '0';
      if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
      if (statInvalidRecords) statInvalidRecords.textContent = '0';
      updateActionButtons();
    }
  }

  function renderErrorReportBox(total) {
    if (!errorReportBox) return;

    if (parsedInvalidRecords.length === 0 && parsedDuplicateRecords.length === 0 && parsedValidRecords.length > 0) {
      errorReportBox.innerHTML = `
        <div class="error-report-icon" style="color: #16a34a;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div style="flex: 1;">
          <div class="error-report-title" style="color: #15803d;">All ${parsedValidRecords.length} records validated successfully!</div>
          <div class="error-report-desc">0 duplicates and 0 errors found. Click "Import Valid Records" to finalize registration.</div>
        </div>
      `;
    } else if (parsedValidRecords.length > 0) {
      errorReportBox.innerHTML = `
        <div class="error-report-icon" style="color: #d97706;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div style="flex: 1;">
          <div class="error-report-title" style="color: #b45309;">
            ${parsedValidRecords.length} valid records ready • ${parsedDuplicateRecords.length} duplicates • ${parsedInvalidRecords.length} invalid records
          </div>
          <div class="error-report-desc">
            You can import the ${parsedValidRecords.length} valid records now, and download the error report to review and correct failed rows.
          </div>
        </div>
      `;
    } else {
      errorReportBox.innerHTML = `
        <div class="error-report-icon" style="color: #dc2626;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div style="flex: 1;">
          <div class="error-report-title" style="color: #b91c1c;">No valid student records could be parsed</div>
          <div class="error-report-desc">All ${total} rows contain validation or duplicate issues. Please download error details to inspect.</div>
        </div>
      `;
    }
  }

  function showEmptyFileError(fileName) {
    if (uploadStatusBadge) {
      uploadStatusBadge.textContent = 'Empty File';
      uploadStatusBadge.style.backgroundColor = '#fee2e2';
      uploadStatusBadge.style.color = '#dc2626';
    }
    if (statTotalRecords) statTotalRecords.textContent = '0';
    if (statValidRecords) statValidRecords.textContent = '0';
    if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
    if (statInvalidRecords) statInvalidRecords.textContent = '0';
    if (errorReportBox) {
      errorReportBox.innerHTML = `
        <div class="error-report-icon" style="color: #dc2626;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div style="flex: 1;">
          <div class="error-report-title" style="color: #b91c1c;">Uploaded file is empty</div>
          <div class="error-report-desc">Please choose a spreadsheet with student records and valid headers.</div>
        </div>
      `;
    }
    updateActionButtons();
  }

  function showEmptyDataError(fileName) {
    if (uploadStatusBadge) {
      uploadStatusBadge.textContent = 'Headers Only (0 Records)';
      uploadStatusBadge.style.backgroundColor = '#fef3c7';
      uploadStatusBadge.style.color = '#b45309';
    }
    if (statTotalRecords) statTotalRecords.textContent = '0';
    if (statValidRecords) statValidRecords.textContent = '0';
    if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
    if (statInvalidRecords) statInvalidRecords.textContent = '0';
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
          <div class="error-report-title">File contains only headers</div>
          <div class="error-report-desc">Please add student data rows under the header columns and re-upload.</div>
        </div>
      `;
    }
    updateActionButtons();
  }

  function updateActionButtons() {
    if (btnImportRecords) {
      if (parsedValidRecords.length > 0) {
        btnImportRecords.disabled = false;
        btnImportRecords.style.cursor = 'pointer';
        btnImportRecords.style.opacity = '1';
        if (importBtnText) importBtnText.textContent = `Import Valid Records (${parsedValidRecords.length})`;
      } else {
        btnImportRecords.disabled = true;
        btnImportRecords.style.cursor = 'not-allowed';
        btnImportRecords.style.opacity = '0.6';
        if (importBtnText) importBtnText.textContent = 'Import Valid Records (0)';
      }
    }

    if (btnDownloadErrors) {
      if (parsedErrorsList.length > 0) {
        btnDownloadErrors.style.display = 'inline-flex';
        btnDownloadErrors.querySelector('span').textContent = `Download Error Details (${parsedErrorsList.length} Issues)`;
      } else {
        btnDownloadErrors.style.display = 'none';
      }
    }
  }

  // Import Action Handler
  if (btnImportRecords) {
    btnImportRecords.addEventListener('click', async () => {
      if (parsedValidRecords.length === 0) return;

      btnImportRecords.disabled = true;
      btnImportRecords.style.opacity = '0.7';
      if (importBtnText) importBtnText.textContent = `Importing ${parsedValidRecords.length} records...`;

      try {
        let registry = [];
        try {
          registry = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
        } catch (e) {
          registry = [];
        }

        const existingMap = new Map();
        registry.forEach(s => {
          if (s && s.id) existingMap.set(String(s.id).trim().toLowerCase(), s);
        });

        let importedCount = 0;
        const newlyImported = [];
        parsedValidRecords.forEach(student => {
          const key = String(student.id).trim().toLowerCase();
          if (!existingMap.has(key)) {
            registry.unshift(student);
            existingMap.set(key, student);
            newlyImported.push(student);
            importedCount++;
          }
        });

        localStorage.setItem('iti_students_registry', JSON.stringify(registry));

        // Submit newly imported records to Google Sheets in background
        if (window.GoogleSheetsService && newlyImported.length > 0) {
          if (typeof GoogleSheetsService.submitBulkStudents === 'function') {
            GoogleSheetsService.submitBulkStudents(newlyImported).catch(err => {
              console.warn('Google Sheets bulk sync warning:', err);
            });
          } else if (typeof GoogleSheetsService.submitStudent === 'function') {
            newlyImported.forEach(s => {
              GoogleSheetsService.submitStudent(s).catch(() => {});
            });
          }
        }

        const count = importedCount;
        parsedValidRecords = [];
        updateActionButtons();

        if (uploadStatusBadge) {
          uploadStatusBadge.textContent = `Successfully Imported (${count} Records)`;
          uploadStatusBadge.style.backgroundColor = '#dcfce7';
          uploadStatusBadge.style.color = '#15803d';
        }

        if (errorReportBox) {
          errorReportBox.innerHTML = `
            <div class="error-report-icon" style="color: #16a34a;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div style="flex: 1;">
              <div class="error-report-title" style="color: #15803d;">Import Completed Successfully!</div>
              <div class="error-report-desc">
                ${count} new student records added to registry. They are now live in All Students, Reports, and Downloads.
              </div>
            </div>
          `;
        }

        if (window.showToast) {
          window.showToast(`✓ Successfully imported ${count} students into registry!`, 'success');
        } else {
          alert(`✓ Successfully imported ${count} students into the tracking registry!`);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to save imported records: ' + err.message);
        btnImportRecords.disabled = false;
        btnImportRecords.style.opacity = '1';
        if (importBtnText) importBtnText.textContent = `Import Valid Records (${parsedValidRecords.length})`;
      }
    });
  }

  // Download Error Details CSV
  if (btnDownloadErrors) {
    btnDownloadErrors.addEventListener('click', () => {
      if (parsedErrorsList.length === 0) {
        alert('No validation errors recorded.');
        return;
      }

      const errorHeaders = ["Row Number", "Student ID", "Student Name", "Mobile Number", "Issue Type", "Reason"];
      const rows = parsedErrorsList.map(item => [
        item.rowNumber,
        item.studentId,
        item.studentName,
        item.mobile,
        item.type,
        item.reason
      ]);

      const csvContent = "data:text/csv;charset=utf-8," +
        errorHeaders.join(",") + "\n" +
        rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `iti_bulk_upload_error_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Sync from Sheet with Persistence to Registry
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
          // Merge into localStorage with duplicate protection
          let registry = [];
          try {
            registry = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
          } catch (e) {
            registry = [];
          }

          const existingMap = new Map();
          registry.forEach(s => {
            if (s && s.id) existingMap.set(String(s.id).trim().toLowerCase(), s);
          });

          let newCount = 0;
          let updatedCount = 0;

          students.forEach(s => {
            const key = String(s.id).trim().toLowerCase();
            if (existingMap.has(key)) {
              // Update existing record
              const existing = existingMap.get(key);
              Object.assign(existing, s);
              updatedCount++;
            } else {
              registry.unshift(s);
              existingMap.set(key, s);
              newCount++;
            }
          });

          localStorage.setItem('iti_students_registry', JSON.stringify(registry));

          if (uploadStatusBadge) {
            uploadStatusBadge.textContent = `Google Sheet (${students.length} Records)`;
            uploadStatusBadge.style.backgroundColor = '#dcfce7';
            uploadStatusBadge.style.color = '#15803d';
          }
          if (statTotalRecords) statTotalRecords.textContent = students.length.toString();
          if (statValidRecords) statValidRecords.textContent = students.length.toString();
          if (statDuplicateRecords) statDuplicateRecords.textContent = updatedCount.toString();
          if (statInvalidRecords) statInvalidRecords.textContent = '0';

          if (errorReportBox) {
            errorReportBox.innerHTML = `
              <div class="error-report-icon" style="color: #16a34a;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div style="flex: 1;">
                <div class="error-report-title" style="color: #15803d;">Google Sheet Synchronized!</div>
                <div class="error-report-desc">
                  ${students.length} students fetched (${newCount} new added, ${updatedCount} existing updated). Saved directly to registry.
                </div>
              </div>
            `;
          }

          const msg = `Fetched ${students.length} records from Google Sheet (${newCount} new, ${updatedCount} updated)!`;
          if (window.showToast) window.showToast(msg, 'success');
          else alert('✓ ' + msg);
        } else {
          if (uploadStatusBadge) {
            uploadStatusBadge.textContent = 'Google Sheet (0 Records)';
            uploadStatusBadge.style.backgroundColor = '#fef3c7';
            uploadStatusBadge.style.color = '#b45309';
          }
          if (statTotalRecords) statTotalRecords.textContent = '0';
          if (statValidRecords) statValidRecords.textContent = '0';
          if (statDuplicateRecords) statDuplicateRecords.textContent = '0';
          if (statInvalidRecords) statInvalidRecords.textContent = '0';
          if (window.showToast) window.showToast('Google Sheet connected! "Student Registration" tab currently has 0 rows.', 'info');
        }
      } catch (e) {
        if (uploadStatusBadge) {
          uploadStatusBadge.textContent = 'Sync Failed';
          uploadStatusBadge.style.backgroundColor = '#fee2e2';
          uploadStatusBadge.style.color = '#dc2626';
        }
        if (window.showToast) window.showToast('Could not fetch from Google Sheet: ' + e.message, 'error');
        else alert('Could not fetch from Google Sheet: ' + e.message);
      }
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
