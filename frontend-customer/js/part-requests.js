document.addEventListener('DOMContentLoaded', () => {
  const partRequestsList = document.getElementById('part-requests-list');
  const partRequestForm = document.getElementById('part-request-form');
  const alertContainer = document.getElementById('alert-container');

  // Load Initial Data
  fetchPartRequests();

  // Helper to format vehicle info beautifully
  function formatVehicleInfo(vehicleInfo) {
    if (!vehicleInfo) return '';
    const parts = vehicleInfo.split(' | ');
    if (parts.length === 4) {
      return `${parts[0]} ${parts[1]} (${parts[2]}) - ${parts[3]}`;
    }
    return vehicleInfo;
  }

  // Helper to show alerts
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    lucide.createIcons();
    
    // Auto-hide success alerts
    if(type === 'success') {
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
  }

  // Fetch and display part requests
  async function fetchPartRequests() {
    try {
      const requests = await api.get('partrequest');
      
      if (requests.length === 0) {
        partRequestsList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">You haven't requested any parts yet.</p>`;
        return;
      }

      partRequestsList.innerHTML = requests.map(req => {
        let badgeClass = 'badge-pending';
        let statusIcon = 'clock';
        
        if (req.status === 'Sourced') {
          badgeClass = 'badge-success';
          statusIcon = 'check-circle';
        } else if (req.status === 'Ordered') {
          badgeClass = 'badge-info';
          statusIcon = 'truck';
        } else if (req.status === 'Unavailable') {
          badgeClass = 'badge-danger';
          statusIcon = 'x-circle';
        }

        let urgencyClass = 'badge-info';
        if (req.urgency === 'High') urgencyClass = 'badge-danger';
        else if (req.urgency === 'Medium') urgencyClass = 'badge-pending';

        return `
          <div class="card" style="padding: 1.25rem; border-radius: 12px; background: rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.25rem;">${req.partName}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="car" style="width: 14px;"></i> ${formatVehicleInfo(req.vehicleInfo)}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                <span class="badge ${badgeClass}" style="display: flex; gap: 0.25rem;">
                  <i data-lucide="${statusIcon}" style="width: 12px; height: 12px; margin-top: 1px;"></i> ${req.status}
                </span>
                <span class="badge ${urgencyClass}" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                  ${req.urgency} Urgency
                </span>
              </div>
            </div>
            
            <p style="font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.75rem; line-height: 1.5; font-style: italic;">"${req.description}"</p>

            <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; margin-top: 0.75rem;">
                <span>Requested on: ${new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to fetch part requests:", error);
      partRequestsList.innerHTML = `<p style="color: var(--status-danger);">Error loading requests.</p>`;
    }
  }

  // Handle Form Submission
  partRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const make = document.getElementById('vehicle-make').value.trim();
    const model = document.getElementById('vehicle-model').value.trim();
    const year = document.getElementById('vehicle-year').value.trim();
    const plate = document.getElementById('vehicle-plate').value.trim();
    const vehicleInfo = `${make} | ${model} | ${year} | ${plate}`;

    const dto = {
      partName: document.getElementById('part-name').value,
      vehicleInfo: vehicleInfo,
      urgency: document.getElementById('urgency').value,
      description: document.getElementById('description').value
    };

    try {
      await api.post('partrequest', dto);
      showAlert('Part request submitted successfully! We are looking into it.', 'success');
      partRequestForm.reset();
      fetchPartRequests();
    } catch (error) {
      showAlert(error.message || 'Failed to submit part request.');
    }
  });
});
