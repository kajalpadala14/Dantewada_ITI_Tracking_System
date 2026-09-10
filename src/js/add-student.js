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

  // Collapsible Menu Groups
  document.querySelectorAll('.menu-group .menu-item').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.menu-group');
      if (parent) parent.classList.toggle('open');
    });
  });

  // Main Form Submit Handler
  const form = document.getElementById('mainAddStudentForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const studentName = document.getElementById('addStuName').value.trim();
      const studentId = document.getElementById('addStuId').value.trim();

      alert(`Student "${studentName}" (${studentId}) registered successfully! Redirecting to All Students registry...`);
      window.location.href = 'students.html';
    });
  }
});
