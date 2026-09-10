/**
 * Dantewada ITI Student Tracking System - Common Shared Functionality
 * Handles global UI behavior across all portal pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Sidebar Toggle (Supports both .open and .active classes)
  const sidebar = document.getElementById('sidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      sidebar.classList.toggle('active');
    });
  }

  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebar.classList.remove('active');
    });
  }

  // Close sidebar on outside click on mobile
  document.addEventListener('click', (e) => {
    if (sidebar && (sidebar.classList.contains('open') || sidebar.classList.contains('active'))) {
      if (!sidebar.contains(e.target) && (!sidebarToggleBtn || !sidebarToggleBtn.contains(e.target))) {
        sidebar.classList.remove('open');
        sidebar.classList.remove('active');
      }
    }
  });

  // 2. Sidebar Accordions (Menu Groups)
  const menuGroups = document.querySelectorAll('.menu-group');
  menuGroups.forEach(group => {
    const header = group.querySelector('.menu-item');
    if (header) {
      header.addEventListener('click', (e) => {
        // Prevent toggling if user clicked directly on a submenu item
        if (!e.target.closest('.submenu')) {
          group.classList.toggle('open');
        }
      });
    }
  });

  // 3. Shared Toast Notification Utility
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0284c7';
    toast.style.cssText = `
      background-color: ${bgColor};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };
});
