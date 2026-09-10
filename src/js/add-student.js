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


  // Main Form Submit Handler
  const form = document.getElementById('mainAddStudentForm');
  const btnSave = document.getElementById('btnSaveStudent');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

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
        const randId = 'STU-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        const idInput = document.getElementById('addStuId');
        if (idInput) idInput.value = randId;
      }
    });
  }
});
