document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('history-table-body');
  const modal = document.getElementById('detail-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // Initial Load
  fetchHistory();

  // Helper to format vehicle info beautifully
  function formatVehicleInfo(vehicleInfo) {
    if (!vehicleInfo) return '';
    const parts = vehicleInfo.split(' | ');
    if (parts.length === 4) {
      return `${parts[0]} ${parts[1]} (${parts[2]}) - ${parts[3]}`;
    }
    return vehicleInfo;
  }

  async function fetchHistory() {
    try {
      const history = await api.get('servicehistory');
      
      if (history.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="color: var(--text-secondary); text-align: center; padding: 2rem;">No service records found.</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = history.map(item => {
        return `
          <tr>
            <td>${new Date(item.serviceDate).toLocaleDateString()}</td>
            <td style="font-weight: 600;">${item.serviceType}</td>
            <td>${formatVehicleInfo(item.vehicleInfo)}</td>
            <td>${item.technicianName}</td>
            <td style="font-weight: 600; color: var(--accent-primary);">$${item.cost.toFixed(2)}</td>
            <td>
              <span class="badge badge-success" style="font-size: 0.75rem;">${item.status}</span>
            </td>
            <td>
              <button class="btn btn-secondary view-details-btn" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" data-id="${item.id}" data-type="${item.serviceType}" data-vehicle="${item.vehicleInfo}" data-tech="${item.technicianName}" data-cost="${item.cost}" data-date="${item.serviceDate}" data-notes="${item.notes || ''}">
                <i data-lucide="eye" style="width: 14px; margin-top: 1px;"></i> Details
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Add Modal Click Listeners
      document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const el = e.currentTarget;
          showDetails(
            el.getAttribute('data-type'),
            el.getAttribute('data-vehicle'),
            el.getAttribute('data-tech'),
            el.getAttribute('data-cost'),
            el.getAttribute('data-date'),
            el.getAttribute('data-notes')
          );
        });
      });

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to load service history:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="color: var(--status-danger); text-align: center; padding: 2rem;">Failed to load service records.</td>
        </tr>
      `;
    }
  }

  function showDetails(type, vehicle, tech, cost, date, notes) {
    modalContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Service Type</div>
          <div style="font-weight: 600; font-size: 1.05rem; margin-top: 0.15rem;">${type}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Service Date</div>
          <div style="font-weight: 600; font-size: 1.05rem; margin-top: 0.15rem;">${new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Vehicle Information</div>
          <div style="margin-top: 0.15rem;">${formatVehicleInfo(vehicle)}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Assigned Technician</div>
          <div style="margin-top: 0.15rem;">${tech}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Total Cost</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-primary); margin-top: 0.15rem;">$${parseFloat(cost).toFixed(2)}</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Job Status</div>
          <div style="margin-top: 0.15rem;"><span class="badge badge-success">Completed</span></div>
        </div>
      </div>

      <div>
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600; margin-bottom: 0.25rem;">Technician Notes & Report</div>
        <p style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); line-height: 1.5; color: var(--text-primary); font-size: 0.9rem;">
          ${notes || "No technician comments recorded for this service."}
        </p>
      </div>
    `;
    modal.style.display = 'flex';
  }

  // Close modal click listeners
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
