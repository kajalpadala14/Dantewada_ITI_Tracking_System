/* ==========================================================================
   DANTEWADA ITI ADD STUDENT FORM - JAVASCRIPT
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

  // Restrict phone numbers to 10 digits and numbers only
  ['addStuMobile', 'addStuAltMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('maxlength', '10');
      el.setAttribute('inputmode', 'numeric');
      el.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      });
    }
  });

  // --- Automatic Student ID Generation ---
  const stuIdInput = document.getElementById('addStuId');
  const btnRegenId = document.getElementById('btnRegenId');

  function calculateNextStudentId() {
    const currentYear = new Date().getFullYear();
    const prefix = `STU-${currentYear}-`;
    let maxSeq = 0;

    try {
      const local = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
      const regex = new RegExp(`^STU-${currentYear}-(\\d+)$`, 'i');
      local.forEach(s => {
        if (s && s.id) {
          const match = String(s.id).trim().match(regex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxSeq) maxSeq = num;
          }
        }
      });
    } catch (e) {
      console.warn('Error reading local registry for ID generation:', e);
    }

    const nextSeq = maxSeq + 1;
    const pad = nextSeq < 1000 ? String(nextSeq).padStart(3, '0') : String(nextSeq);
    return `${prefix}${pad}`;
  }

  function setAutoStudentId() {
    if (stuIdInput) {
      stuIdInput.value = calculateNextStudentId();
    }
  }

  // Generate on initial page load
  setAutoStudentId();

  // Regenerate button event
  if (btnRegenId) {
    btnRegenId.addEventListener('click', () => {
      setAutoStudentId();
    });
  }

  // Cross-check with Google Sheets remote registry in background
  if (window.GoogleSheetsService && typeof GoogleSheetsService.fetchStudents === 'function') {
    GoogleSheetsService.fetchStudents().then(remoteStudents => {
      if (Array.isArray(remoteStudents) && remoteStudents.length > 0 && stuIdInput) {
        const currentYear = new Date().getFullYear();
        const regex = new RegExp(`^STU-${currentYear}-(\\d+)$`, 'i');
        let remoteMax = 0;
        remoteStudents.forEach(s => {
          if (s && s.id) {
            const match = String(s.id).trim().match(regex);
            if (match) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > remoteMax) remoteMax = num;
            }
          }
        });

        if (remoteMax > 0) {
          const match = stuIdInput.value.match(regex);
          const currentSeq = match ? parseInt(match[1], 10) : 0;
          if (remoteMax >= currentSeq) {
            const nextSeq = remoteMax + 1;
            const pad = nextSeq < 1000 ? String(nextSeq).padStart(3, '0') : String(nextSeq);
            stuIdInput.value = `STU-${currentYear}-${pad}`;
          }
        }
      }
    }).catch(() => {});
  }

  // Auto-sync Block based on ITI selection
  const itiSelect = document.getElementById('addStuItiName');
  const blockSelect = document.getElementById('addStuBlock');
  if (itiSelect && blockSelect) {
    itiSelect.addEventListener('change', () => {
      const val = itiSelect.value.toLowerCase();
      if (val.includes('dantewada')) blockSelect.value = 'Dantewada';
      else if (val.includes('gidam') || val.includes('geedam')) blockSelect.value = 'Geedam';
      else if (val.includes('katekalyan')) blockSelect.value = 'Katekalyan';
      else if (val.includes('kuakonda')) blockSelect.value = 'Kuakonda';
    });
  }

  // Main Form Submit Handler
  const form = document.getElementById('mainAddStudentForm');
  const btnSave = document.getElementById('btnSaveStudent');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Mobile Number validation (must be exactly 10 digits starting with 6-9)
      const mobileInput = document.getElementById('addStuMobile');
      const mobileVal = (mobileInput?.value || '').trim();
      if (!/^[6-9]\d{9}$/.test(mobileVal)) {
        alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाले 10 अंक)।');
        if (mobileInput) mobileInput.focus();
        return;
      }

      // Alternate Mobile Number validation (optional, but if given must be 10 digits starting with 6-9)
      const altMobileInput = document.getElementById('addStuAltMobile');
      const altMobileVal = (altMobileInput?.value || '').trim();
      if (altMobileVal && !/^[6-9]\d{9}$/.test(altMobileVal)) {
        alert('कृपया 10 अंकों का मान्य Alternate Mobile Number दर्ज करें।');
        if (altMobileInput) altMobileInput.focus();
        return;
      }

      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Saving & Syncing to Google Sheet...';
      }

      // Sanitizer to prevent spreadsheet formula injection (=, +, -, @)
      function sanitizeInput(val, fallback = '') {
        let str = (val || fallback).toString().trim();
        if (/^[=+\-@\t\r]/.test(str)) {
          str = "'" + str;
        }
        return str;
      }

      // Collect all 24 exact schema fields
      const studentData = {
        id: sanitizeInput(document.getElementById('addStuId')?.value),
        name: sanitizeInput(document.getElementById('addStuName')?.value),
        fatherName: sanitizeInput(document.getElementById('addStuFather')?.value),
        motherName: sanitizeInput(document.getElementById('addStuMother')?.value),
        gender: sanitizeInput(document.getElementById('addStuGender')?.value),
        dob: sanitizeInput(document.getElementById('addStuDob')?.value),
        mobile: sanitizeInput(document.getElementById('addStuMobile')?.value),
        altMobile: sanitizeInput(document.getElementById('addStuAltMobile')?.value),
        email: sanitizeInput(document.getElementById('addStuEmail')?.value),
        address: sanitizeInput(document.getElementById('addStuAddress')?.value),
        block: sanitizeInput(document.getElementById('addStuBlock')?.value),
        district: sanitizeInput(document.getElementById('addStuDistrict')?.value, 'Dantewada'),
        state: sanitizeInput(document.getElementById('addStuState')?.value, 'Chhattisgarh'),
        pin: sanitizeInput(document.getElementById('addStuPin')?.value, '494449'),
        year: sanitizeInput(document.getElementById('addStuAcadYear')?.value, '2024-25'),
        iti: sanitizeInput(document.getElementById('addStuItiName')?.value),
        trade: sanitizeInput(document.getElementById('addStuTradeName')?.value),
        admissionDate: sanitizeInput(document.getElementById('addStuAdmissionDate')?.value),
        duration: sanitizeInput(document.getElementById('addStuDuration')?.value, '2 Years'),
        expectedDate: sanitizeInput(document.getElementById('addStuCompletionDate')?.value),
        trainingStatus: sanitizeInput(document.getElementById('addStuTrainStatus')?.value, 'Under Training'),
        employmentStatus: sanitizeInput(document.getElementById('addStuEmpStatus')?.value, 'Not Applicable'),
        regNumber: sanitizeInput(document.getElementById('addStuRegNo')?.value),
        rollNumber: sanitizeInput(document.getElementById('addStuRollNo')?.value),
        govId: sanitizeInput(document.getElementById('addStuGovRef')?.value),
        updated: 'Just now'
      };

      // 1. Save to Local Storage Registry
      try {
        const localStudents = JSON.parse(localStorage.getItem('iti_students_registry') || '[]');
        // Check if existing student by ID, otherwise unshift
        const idx = localStudents.findIndex(s => s.id === studentData.id);
        if (idx >= 0) {
          localStudents[idx] = studentData;
        } else {
          localStudents.unshift(studentData);
        }
        localStorage.setItem('iti_students_registry', JSON.stringify(localStudents));
      } catch (err) {
        console.warn('Local storage error:', err);
      }

      // 2. Submit to Google Sheets via GoogleSheetsService (Student Registration tab)
      let syncResult = { success: true };
      if (window.GoogleSheetsService && typeof GoogleSheetsService.submitStudent === 'function') {
        syncResult = await GoogleSheetsService.submitStudent(studentData);
      }

      if (btnSave) {
        btnSave.disabled = false;
        btnSave.textContent = 'Save Student & Sync to Google Sheet';
      }

      const syncMsg = syncResult.queued
        ? '⚠️ Saved locally and queued for sync. Apps Script URL is being connected.'
        : '✓ Saved and sent directly to Google Sheet (Student Registration tab)!';

      const proceed = confirm(
        `✓ Student "${studentData.name}" (${studentData.id}) registered successfully!\n\n${syncMsg}\n\nClick "OK" to view All Students Registry, or "Cancel" to add another student.`
      );

      if (proceed) {
        window.location.href = 'students.html';
      } else {
        form.reset();
        setAutoStudentId();
      }
    });
  }
});
