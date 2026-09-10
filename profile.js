/**
 * Dantewada ITI Student Tracking System - Profile (Admin / Officer Profile)
 * Matching screenshot layout but tailored for Administrator / Officer
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

  // Profile Edit Modal
  const profileModal = document.getElementById('profileModal');
  const btnEditProfile = document.getElementById('btnEditProfile');
  const modalProfileCloseBtn = document.getElementById('modalProfileCloseBtn');
  const btnProfileModalCancel = document.getElementById('btnProfileModalCancel');
  const btnProfileModalSave = document.getElementById('btnProfileModalSave');

  const editNameInput = document.getElementById('editNameInput');
  const editPhoneInput = document.getElementById('editPhoneInput');
  const editEmailInput = document.getElementById('editEmailInput');
  const editAddressInput = document.getElementById('editAddressInput');

  const dispName = document.getElementById('dispName');
  const dispPhone = document.getElementById('dispPhone');
  const dispEmail = document.getElementById('dispEmail');

  const infoName = document.getElementById('infoName');
  const infoPhone = document.getElementById('infoPhone');
  const infoEmail = document.getElementById('infoEmail');
  const infoAddress = document.getElementById('infoAddress');

  function openProfileModal() {
    if (!profileModal) return;
    profileModal.style.display = 'flex';
  }

  function closeProfileModal() {
    if (!profileModal) return;
    profileModal.style.display = 'none';
  }

  if (btnEditProfile) btnEditProfile.addEventListener('click', openProfileModal);
  if (modalProfileCloseBtn) modalProfileCloseBtn.addEventListener('click', closeProfileModal);
  if (btnProfileModalCancel) btnProfileModalCancel.addEventListener('click', closeProfileModal);
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) closeProfileModal();
    });
  }

  if (btnProfileModalSave) {
    btnProfileModalSave.addEventListener('click', () => {
      const name = editNameInput.value.trim();
      const phone = editPhoneInput.value.trim();
      const email = editEmailInput.value.trim();
      const address = editAddressInput.value.trim();

      if (name) {
        if (dispName) dispName.textContent = name;
        if (infoName) infoName.textContent = name;
      }
      if (phone) {
        if (dispPhone) dispPhone.textContent = phone;
        if (infoPhone) infoPhone.textContent = phone;
      }
      if (email) {
        if (dispEmail) dispEmail.textContent = email;
        if (infoEmail) infoEmail.textContent = email;
      }
      if (address) {
        if (infoAddress) infoAddress.textContent = address;
      }

      alert('Profile details updated successfully!');
      closeProfileModal();
    });
  }

  // Admin Profile Tab switcher
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});
