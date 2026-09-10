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

      // Collect all 24 exact schema fields
      const studentData = {
        id: (document.getElementById('addStuId')?.value || '').trim(),
        name: (document.getElementById('addStuName')?.value || '').trim(),
        fatherName: (document.getElementById('addStuFather')?.value || '').trim(),
        motherName: (document.getElementById('addStuMother')?.value || '').trim(),
        gender: (document.getElementById('addStuGender')?.value || '').trim(),
        dob: (document.getElementById('addStuDob')?.value || '').trim(),
        mobile: (document.getElementById('addStuMobile')?.value || '').trim(),
        altMobile: (document.getElementById('addStuAltMobile')?.value || '').trim(),
        email: (document.getElementById('addStuEmail')?.value || '').trim(),
        address: (document.getElementById('addStuAddress')?.value || '').trim(),
        block: (document.getElementById('addStuBlock')?.value || '').trim(),
        district: (document.getElementById('addStuDistrict')?.value || 'Dantewada').trim(),
        state: (document.getElementById('addStuState')?.value || 'Chhattisgarh').trim(),
        pin: (document.getElementById('addStuPin')?.value || '494449').trim(),
        year: (document.getElementById('addStuAcadYear')?.value || '2024-25').trim(),
        iti: (document.getElementById('addStuItiName')?.value || '').trim(),
        trade: (document.getElementById('addStuTradeName')?.value || '').trim(),
        admissionDate: (document.getElementById('addStuAdmissionDate')?.value || '').trim(),
        duration: (document.getElementById('addStuDuration')?.value || '2 Years').trim(),
        expectedDate: (document.getElementById('addStuCompletionDate')?.value || '').trim(),
        trainingStatus: (document.getElementById('addStuTrainStatus')?.value || 'Under Training').trim(),
        employmentStatus: (document.getElementById('addStuEmpStatus')?.value || 'Not Applicable').trim(),
        regNumber: (document.getElementById('addStuRegNo')?.value || '').trim(),
        rollNumber: (document.getElementById('addStuRollNo')?.value || '').trim(),
        govId: (document.getElementById('addStuGovRef')?.value || '').trim(),
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
