document.addEventListener('DOMContentLoaded', () => {
  const appointmentsList = document.getElementById('appointments-list');
  const appointmentForm = document.getElementById('appointment-form');
  const alertContainer = document.getElementById('alert-container');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const submitBtn = document.getElementById('submit-btn');
  const formTitle = document.getElementById('form-title');
  const appointmentIdInput = document.getElementById('appointment-id');

  let allAppointments = [];

  // Helper to format vehicle info beautifully
  function formatVehicleInfo(vehicleInfo) {
    if (!vehicleInfo) return '';
    const parts = vehicleInfo.split(' | ');
    if (parts.length === 4) {
      return `${parts[0]} ${parts[1]} (${parts[2]}) - ${parts[3]}`;
    }
    return vehicleInfo;
  }

  // Load Initial Data
  fetchAppointments();

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

  // Fetch and display appointments
  async function fetchAppointments() {
    try {
      const appointments = await api.get('appointment');
      allAppointments = appointments;
      
      if (appointments.length === 0) {
        appointmentsList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">You don't have any appointments yet.</p>`;
        return;
      }

      appointmentsList.innerHTML = appointments.map(apt => {
        let badgeClass = 'badge-pending';
        let statusIcon = 'clock';
        
        if (apt.status === 'Confirmed') {
          badgeClass = 'badge-info';
          statusIcon = 'check-circle-2';
        } else if (apt.status === 'Completed') {
          badgeClass = 'badge-success';
          statusIcon = 'check-circle';
        } else if (apt.status === 'Cancelled') {
          badgeClass = 'badge-danger';
          statusIcon = 'x-circle';
        }

        const canEdit = apt.status === 'Pending' || apt.status === 'Confirmed';

        return `
          <div class="card" style="padding: 1.25rem; border-radius: 12px; background: rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.25rem;">${apt.serviceType}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="car" style="width: 14px;"></i> ${formatVehicleInfo(apt.vehicleInfo)}
                </div>
              </div>
              <span class="badge ${badgeClass}" style="display: flex; gap: 0.25rem;">
                <i data-lucide="${statusIcon}" style="width: 12px; height: 12px; margin-top: 1px;"></i> ${apt.status}
              </span>
            </div>
            
            <div style="display: flex; gap: 1.5rem; font-size: 0.9rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                <i data-lucide="calendar-days" style="color: var(--accent-primary); width: 16px;"></i>
                ${new Date(apt.preferredDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                <i data-lucide="clock" style="color: var(--accent-primary); width: 16px;"></i>
                ${apt.preferredTime}
              </div>
            </div>

            ${apt.notes ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; font-style: italic;">"${apt.notes}"</div>` : ''}

            ${canEdit ? `
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-secondary edit-btn" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" data-id="${apt.id}">
                  <i data-lucide="edit"></i> Reschedule
                </button>
                <button class="btn btn-danger cancel-btn" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" data-id="${apt.id}">
                  <i data-lucide="x"></i> Cancel
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      // Add event listeners for edit and cancel buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.getAttribute('data-id'));
          const apt = allAppointments.find(a => a.id === id);
          if (apt) {
            enterEditMode(
              apt.id,
              apt.serviceType,
              apt.vehicleInfo,
              apt.preferredDate.split('T')[0],
              apt.preferredTime,
              apt.notes || ''
            );
          }
        });
      });

      document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const apt = allAppointments.find(a => a.id === parseInt(id));
          
          const modal = document.getElementById('confirm-modal');
          const modalText = document.getElementById('confirm-modal-text');
          const modalTitle = document.getElementById('confirm-modal-title');
          const okBtn = document.getElementById('confirm-modal-ok');
          const cancelBtn = document.getElementById('confirm-modal-cancel');

          modalTitle.textContent = 'Cancel Appointment';
          modalText.innerHTML = `Are you sure you want to cancel your <strong style="color: var(--text-primary);">${apt ? apt.serviceType : ''}</strong> appointment?<br><span style="font-size: 0.85rem;">This action cannot be undone.</span>`;
          modal.style.display = 'flex';
          lucide.createIcons();

          // Clone to remove old listeners
          const newOkBtn = okBtn.cloneNode(true);
          okBtn.parentNode.replaceChild(newOkBtn, okBtn);
          const newCancelBtn = cancelBtn.cloneNode(true);
          cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

          newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
          });

          newOkBtn.addEventListener('click', async () => {
            modal.style.display = 'none';
            try {
              await api.delete(`appointment/${id}`);
              showAlert('Appointment cancelled successfully.', 'success');
              fetchAppointments();
            } catch (err) {
              showAlert(err.message || 'Failed to cancel appointment.');
            }
          });
        });
      });

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      appointmentsList.innerHTML = `<p style="color: var(--status-danger);">Error loading appointments.</p>`;
    }
  }

  // Handle Form Submission (Create or Update)
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const id = appointmentIdInput.value;
    const isEdit = !!id;

    const make = document.getElementById('vehicle-make').value.trim();
    const model = document.getElementById('vehicle-model').value.trim();
    const year = document.getElementById('vehicle-year').value.trim();
    const plate = document.getElementById('vehicle-plate').value.trim();
    const vehicleInfo = `${make} | ${model} | ${year} | ${plate}`;

    const dto = {
      serviceType: document.getElementById('service-type').value,
      vehicleInfo: vehicleInfo,
      preferredDate: document.getElementById('preferred-date').value,
      preferredTime: document.getElementById('preferred-time').value,
      notes: document.getElementById('notes').value
    };

    try {
      if (isEdit) {
        await api.put(`appointment/${id}`, dto);
        showAlert('Appointment updated successfully!', 'success');
        exitEditMode();
      } else {
        await api.post('appointment', dto);
        showAlert('Appointment booked successfully!', 'success');
        appointmentForm.reset();
      }
      fetchAppointments();
    } catch (error) {
      showAlert(error.message || 'Failed to save appointment. Ensure time is in HH:mm format.');
    }
  });

  // Edit Mode Logic
  function enterEditMode(id, service, vehicle, date, time, notes) {
    appointmentIdInput.value = id;
    
    // Try to set select, if value doesn't exactly match, might need loose matching or just setting it if it exists
    const serviceSelect = document.getElementById('service-type');
    let optionFound = Array.from(serviceSelect.options).some(opt => opt.value === service);
    if(optionFound) {
        serviceSelect.value = service;
    } else {
        // Fallback if the exact string isn't in the predefined options, though normally it would be.
        // We could add it temporarily or just leave it blank if they changed it manually in db.
    }

    if (vehicle) {
      const parts = vehicle.split(' | ');
      if (parts.length === 4) {
        document.getElementById('vehicle-make').value = parts[0];
        document.getElementById('vehicle-model').value = parts[1];
        document.getElementById('vehicle-year').value = parts[2];
        document.getElementById('vehicle-plate').value = parts[3];
      } else {
        // Fallback for legacy records
        document.getElementById('vehicle-make').value = vehicle;
        document.getElementById('vehicle-model').value = '';
        document.getElementById('vehicle-year').value = '';
        document.getElementById('vehicle-plate').value = '';
      }
    }
    document.getElementById('preferred-date').value = date;
    
    // time format handling (e.g. "14:30:00" -> "14:30")
    if (time && time.length >= 5) {
        document.getElementById('preferred-time').value = time.substring(0, 5);
    } else {
        document.getElementById('preferred-time').value = time;
    }
    
    document.getElementById('notes').value = notes;

    formTitle.innerHTML = `<i data-lucide="edit" style="color: var(--accent-primary);"></i> Reschedule Service`;
    submitBtn.innerHTML = `Update Appointment <i data-lucide="save"></i>`;
    cancelEditBtn.style.display = 'inline-block';
    lucide.createIcons();
    
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitEditMode() {
    appointmentIdInput.value = '';
    appointmentForm.reset();
    formTitle.innerHTML = `<i data-lucide="plus-circle" style="color: var(--accent-primary);"></i> Schedule Service`;
    submitBtn.innerHTML = `Book Appointment <i data-lucide="calendar"></i>`;
    cancelEditBtn.style.display = 'none';
    lucide.createIcons();
  }

  cancelEditBtn.addEventListener('click', exitEditMode);
});
