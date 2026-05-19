// Reusable Sidebar and Top Header Component
document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is authenticated first
  if (!api.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const user = api.getUser();
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

  // Inject Sidebar
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.className = 'sidebar';
    sidebarContainer.innerHTML = `
      <div class="sidebar-brand">
        <a href="dashboard.html" class="sidebar-logo">
          <i data-lucide="wrench"></i> Nisha<span>Cars</span>
        </a>
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-menu-item ${currentPath === 'dashboard.html' ? 'active' : ''}">
          <a href="dashboard.html"><i data-lucide="layout-dashboard"></i> Dashboard</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'appointments.html' ? 'active' : ''}">
          <a href="appointments.html"><i data-lucide="calendar"></i> Appointments</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'service-centers.html' ? 'active' : ''}">
          <a href="service-centers.html"><i data-lucide="map-pin"></i> Service Centers</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'service-history.html' ? 'active' : ''}">
          <a href="service-history.html"><i data-lucide="history"></i> Service History</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'purchase-history.html' ? 'active' : ''}">
          <a href="purchase-history.html"><i data-lucide="shopping-bag"></i> Purchase History</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'part-requests.html' ? 'active' : ''}">
          <a href="part-requests.html"><i data-lucide="package"></i> Part Requests</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'payments.html' ? 'active' : ''}">
          <a href="payments.html"><i data-lucide="credit-card"></i> Payments</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'reviews.html' ? 'active' : ''}">
          <a href="reviews.html"><i data-lucide="star"></i> Reviews</a>
        </li>
        <li class="sidebar-menu-item ${currentPath === 'profile.html' ? 'active' : ''}">
          <a href="profile.html"><i data-lucide="user"></i> My Profile</a>
        </li>
      </ul>
      <div class="sidebar-footer">
        <button id="logout-btn" class="btn btn-secondary" style="width: 100%; justify-content: flex-start;">
          <i data-lucide="log-out"></i> Log Out
        </button>
      </div>
    `;

    // Logout Action
    document.getElementById('logout-btn').addEventListener('click', () => {
      api.logout();
    });
  }

  // Inject Top Header
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.className = 'content-header';
    
    // Page Title determination
    let pageTitle = 'Dashboard';
    if (currentPath === 'appointments.html') pageTitle = 'Book Appointment';
    else if (currentPath === 'service-centers.html') pageTitle = 'Our Service Centers';
    else if (currentPath === 'service-history.html') pageTitle = 'Service History';
    else if (currentPath === 'purchase-history.html') pageTitle = 'Purchase History';
    else if (currentPath === 'part-requests.html') pageTitle = 'Request Unavailable Parts';
    else if (currentPath === 'payments.html') pageTitle = 'Track Pending Payments';
    else if (currentPath === 'reviews.html') pageTitle = 'Submit Reviews';
    else if (currentPath === 'profile.html') pageTitle = 'Profile & Settings';

    headerContainer.innerHTML = `
      <div>
        <h1 style="margin: 0; font-size: 1.8rem;">${pageTitle}</h1>
        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Customer Portal</p>
      </div>
      <div class="user-nav">
        <!-- Notification Dropdown Toggle -->
        <div class="notification-bell" id="notification-toggle">
          <i data-lucide="bell"></i>
          <span class="notification-badge" id="header-unread-count" style="display: none;">0</span>
        </div>
        
        <!-- User avatar and info -->
        <div class="user-profile-badge" onclick="window.location.href='profile.html'">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60" id="header-avatar" class="user-avatar" alt="Avatar">
          <div class="user-info-text" style="display: flex; flex-direction: column;">
            <span class="user-name" id="header-user-name">${user.fullName}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Premium Member</span>
          </div>
        </div>
      </div>
    `;
  }

  // Refresh user avatar on startup if profile details are stored
  loadHeaderAvatar();
  fetchUnreadNotificationsCount();

  async function loadHeaderAvatar() {
    try {
      const profile = await api.get('customer/profile');
      if (profile.profileImageUrl) {
        document.getElementById('header-avatar').src = profile.profileImageUrl;
      }
    } catch (e) {
      console.warn("Could not fetch user avatar for header", e);
    }
  }

  async function fetchUnreadNotificationsCount() {
    try {
      const notifications = await api.get('notification');
      const unread = notifications.filter(n => !n.isRead);
      const badge = document.getElementById('header-unread-count');
      if (badge) {
        if (unread.length > 0) {
          badge.textContent = unread.length;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (e) {
      console.warn("Could not fetch notifications count for header", e);
    }
  }

  // Hook up notification bell click
  const notifToggle = document.getElementById('notification-toggle');
  if (notifToggle) {
    notifToggle.addEventListener('click', () => {
      if (currentPath !== 'dashboard.html') {
        window.location.href = 'dashboard.html';
      } else {
        // Scroll to notifications section if already on dashboard
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  // Reload icons
  lucide.createIcons();
});
