document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  
  // Set welcome name
  document.getElementById('welcome-name').textContent = user.fullName || 'Customer';

  // Load Dashboard Data
  fetchSummaryStats();
  fetchNotifications();
  fetchServiceCenters();

  // Mark all notifications as read listener
  document.getElementById('mark-all-read').addEventListener('click', async () => {
    try {
      await api.put('notification/read-all', {});
      fetchNotifications();
      // Also update header count
      const badge = document.getElementById('header-unread-count');
      if (badge) badge.style.display = 'none';
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  });

  async function fetchSummaryStats() {
    try {
      // 1. Appointments
      const appointments = await api.get('appointment');
      const upcomingAppointmentsCount = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length;
      document.getElementById('stat-appointments').textContent = upcomingAppointmentsCount;

      // 2. Payments
      const payments = await api.get('payment');
      const unpaidInvoicesCount = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').length;
      document.getElementById('stat-payments').textContent = unpaidInvoicesCount;

      // 3. Part Requests
      const partRequests = await api.get('partrequest');
      document.getElementById('stat-part-requests').textContent = partRequests.length;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  }

  async function fetchNotifications() {
    const list = document.getElementById('notifications-list');
    try {
      const notifications = await api.get('notification');
      
      if (notifications.length === 0) {
        list.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 1rem;">No recent notifications.</p>`;
        return;
      }

      list.innerHTML = notifications.map(notification => {
        let icon = 'info';
        if (notification.type === 'appointment') icon = 'calendar';
        else if (notification.type === 'part') icon = 'cpu';
        else if (notification.type === 'payment') icon = 'credit-card';
        else if (notification.type === 'review') icon = 'star';

        const readClass = notification.isRead ? 'opacity: 0.6;' : 'border-left: 3px solid var(--accent-primary);';

        return `
          <div class="card" style="padding: 1rem; border-radius: 10px; margin-bottom: 0.25rem; display: flex; align-items: start; gap: 0.75rem; ${readClass}">
            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px; font-size: 1rem; color: var(--accent-primary);">
              <i data-lucide="${icon}"></i>
            </div>
            <div style="flex-grow: 1;">
              <div style="font-weight: 600; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
                <span>${notification.title}</span>
                ${!notification.isRead ? `<button class="mark-read-btn btn btn-secondary" data-id="${notification.id}" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border-radius: 4px;">Mark read</button>` : ''}
              </div>
              <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.25rem;">${notification.message}</p>
              <div style="font-size: 0.7rem; color: rgba(255,255,255,0.2); margin-top: 0.25rem;">
                ${new Date(notification.createdAt).toLocaleDateString()} ${new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add individual read listeners
      document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          try {
            await api.put(`notification/${id}/read`, {});
            fetchNotifications();
            // Refresh header badge
            const badge = document.getElementById('header-unread-count');
            if (badge) {
              const currentVal = parseInt(badge.textContent) - 1;
              if (currentVal > 0) {
                badge.textContent = currentVal;
              } else {
                badge.style.display = 'none';
              }
            }
          } catch (err) {
            console.error("Failed to mark read:", err);
          }
        });
      });

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      list.innerHTML = `<p style="color: var(--status-danger); text-align: center;">Error loading alerts.</p>`;
    }
  }

  async function fetchServiceCenters() {
    const list = document.getElementById('service-centers-list');
    try {
      const centers = await api.get('servicecenter');
      
      if (centers.length === 0) {
        list.innerHTML = `<p style="color: var(--text-secondary);">No service centers listed.</p>`;
        return;
      }

      list.innerHTML = centers.map(center => `
        <div class="card" style="padding: 1.25rem; border-radius: 12px; background: rgba(0,0,0,0.15);">
          <h4 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="shield-check" style="color: var(--status-success); width: 16px;"></i> ${center.name}
          </h4>
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem;">
            <div style="display: flex; align-items: start; gap: 0.5rem;">
              <i data-lucide="map-pin" style="width: 14px; margin-top: 2px;"></i>
              <span>${center.address}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="phone" style="width: 14px;"></i>
              <span>${center.phone}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="mail" style="width: 14px;"></i>
              <span>${center.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="clock" style="width: 14px;"></i>
              <span>${center.operatingHours}</span>
            </div>
          </div>
          <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--accent-primary); letter-spacing: 0.05em; margin-bottom: 0.25rem;">Offered Services</div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${center.servicesOffered}</p>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to fetch service centers:", error);
      list.innerHTML = `<p style="color: var(--status-danger);">Error loading locations.</p>`;
    }
  }
});
