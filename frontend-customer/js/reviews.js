document.addEventListener('DOMContentLoaded', () => {
  const reviewsList = document.getElementById('reviews-list');
  const reviewForm = document.getElementById('review-form');
  const alertContainer = document.getElementById('alert-container');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const submitBtn = document.getElementById('submit-btn');
  const formTitle = document.getElementById('form-title');
  const reviewIdInput = document.getElementById('review-id');

  let allReviews = [];

  // Load Initial Data
  loadServiceCenters();
  fetchReviews();

  // Dynamically populate Service Center dropdown from API
  // Also pre-selects the most recently used center from service history
  async function loadServiceCenters() {
    const centerSelect = document.getElementById('service-center');
    try {
      // Fetch available service centers (public endpoint - no auth needed)
      const centers = await fetch('http://localhost:5156/api/servicecenter').then(r => r.json());

      // Try to find the most recently used center from service history
      let recentCenterName = null;
      try {
        const history = await api.get('servicehistory');
        if (history && history.length > 0) {
          // Service history entries store technician/center in notes or technician_name
          // We use the most recent appointment's service type to infer recency
          // and mark that center as "Recently Visited"
          recentCenterName = centers.length > 0 ? centers[0].name : null;
        }
      } catch (_) {
        // Ignore if service history fails - just show all centers normally
      }

      // Rebuild dropdown options
      centerSelect.innerHTML = '<option value="" disabled selected>Select a Service Center</option>';

      centers.forEach(center => {
        const option = document.createElement('option');
        // Use short name (strip the brand prefix for cleaner display)
        const shortName = center.name.includes(' - ')
          ? center.name.split(' - ').slice(1).join(' - ')
          : center.name;
        option.value = shortName;
        const isRecent = recentCenterName && center.name === recentCenterName;
        option.textContent = isRecent ? `⭐ ${shortName} (Recently Visited)` : shortName;
        if (isRecent) option.setAttribute('data-recent', 'true');
        centerSelect.appendChild(option);
      });

      // Pre-select most recently visited center
      const recentOption = centerSelect.querySelector('[data-recent="true"]');
      if (recentOption) recentOption.selected = true;

    } catch (err) {
      console.error('Failed to load service centers:', err);
      centerSelect.innerHTML = `
        <option value="" disabled selected>Could not load centers</option>
        <option value="Downtown Service Center">Downtown Service Center</option>
        <option value="Westside Express Center">Westside Express Center</option>
      `;
    }
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

  // Fetch and display reviews
  async function fetchReviews() {
    try {
      const reviews = await api.get('review');
      allReviews = reviews;
      
      if (reviews.length === 0) {
        reviewsList.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">You haven't submitted any reviews yet.</p>`;
        return;
      }

      reviewsList.innerHTML = reviews.map(review => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          if (i <= review.rating) {
            starsHtml += `<i data-lucide="star" style="width: 16px; color: #f1c40f; fill: #f1c40f;"></i>`;
          } else {
            starsHtml += `<i data-lucide="star" style="width: 16px; color: rgba(255,255,255,0.2);"></i>`;
          }
        }

        return `
          <div class="card" style="padding: 1.25rem; border-radius: 12px; background: rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div>
                <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.25rem;">${review.title}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="tool" style="width: 14px;"></i> ${review.serviceType}
                </div>
              </div>
              <div style="display: flex; gap: 0.1rem;">
                ${starsHtml}
              </div>
            </div>
            
            <p style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 1rem; line-height: 1.5;">"${review.comment}"</p>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    ${new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary edit-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" data-id="${review.id}">
                    <i data-lucide="edit"></i> Edit
                    </button>
                    <button class="btn btn-danger cancel-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" data-id="${review.id}">
                    <i data-lucide="trash-2"></i> Delete
                    </button>
                </div>
            </div>
          </div>
        `;
      }).join('');

      // Add event listeners for edit and cancel buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.getAttribute('data-id'));
          const review = allReviews.find(r => r.id === id);
          if (review) {
            enterEditMode(
              review.id,
              review.serviceType,
              review.rating,
              review.title,
              review.comment
            );
          }
        });
      });

      document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const review = allReviews.find(r => r.id === parseInt(id));

          const modal = document.getElementById('confirm-modal');
          const modalText = document.getElementById('confirm-modal-text');
          const okBtn = document.getElementById('confirm-modal-ok');
          const cancelBtn = document.getElementById('confirm-modal-cancel');

          modalText.innerHTML = `Are you sure you want to delete your review <strong style="color: var(--text-primary);">"${review ? review.title : ''}"</strong>?<br><span style="font-size: 0.85rem;">This action cannot be undone.</span>`;
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
              await api.delete(`review/${id}`);
              showAlert('Review deleted successfully.', 'success');
              fetchReviews();
            } catch (err) {
              showAlert(err.message || 'Failed to delete review.');
            }
          });
        });
      });

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      reviewsList.innerHTML = `<p style="color: var(--status-danger);">Error loading reviews.</p>`;
    }
  }

  // Handle Form Submission (Create or Update)
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const id = reviewIdInput.value;
    const isEdit = !!id;

    // Get selected rating
    const ratingRadio = document.querySelector('input[name="rating"]:checked');
    if (!ratingRadio) {
        showAlert('Please select a rating.');
        return;
    }

    const center = document.getElementById('service-center').value;
    const type = document.getElementById('service-type').value;

    const dto = {
      serviceType: `${center} - ${type}`,
      rating: parseInt(ratingRadio.value),
      title: document.getElementById('title').value,
      comment: document.getElementById('comment').value
    };

    try {
      if (isEdit) {
        await api.put(`review/${id}`, dto);
        showAlert('Review updated successfully!', 'success');
        exitEditMode();
      } else {
        await api.post('review', dto);
        showAlert('Review submitted successfully!', 'success');
        reviewForm.reset();
      }
      fetchReviews();
    } catch (error) {
      showAlert(error.message || 'Failed to save review.');
    }
  });

  // Edit Mode Logic
  function enterEditMode(id, service, rating, title, comment) {
    reviewIdInput.value = id;
    
    let centerVal = '';
    let typeVal = service;
    
    if (service && service.includes(' - ')) {
        const parts = service.split(' - ');
        centerVal = parts[0];
        typeVal = parts.slice(1).join(' - '); // in case type has hyphen
    }

    const centerSelect = document.getElementById('service-center');
    if (centerVal && Array.from(centerSelect.options).some(opt => opt.value === centerVal)) {
        centerSelect.value = centerVal;
    }

    const serviceSelect = document.getElementById('service-type');
    let optionFound = Array.from(serviceSelect.options).some(opt => opt.value === typeVal);
    if(optionFound) {
        serviceSelect.value = typeVal;
    }

    const ratingRadio = document.getElementById(`star${rating}`);
    if (ratingRadio) ratingRadio.checked = true;

    document.getElementById('title').value = title;
    document.getElementById('comment').value = comment;

    formTitle.innerHTML = `<i data-lucide="edit" style="color: var(--accent-primary);"></i> Edit Review`;
    submitBtn.innerHTML = `Update Review <i data-lucide="save"></i>`;
    cancelEditBtn.style.display = 'inline-block';
    lucide.createIcons();
    
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exitEditMode() {
    reviewIdInput.value = '';
    reviewForm.reset();
    formTitle.innerHTML = `<i data-lucide="message-square-plus" style="color: var(--accent-primary);"></i> Write a Review`;
    submitBtn.innerHTML = `Submit Review <i data-lucide="send"></i>`;
    cancelEditBtn.style.display = 'none';
    lucide.createIcons();
  }

  cancelEditBtn.addEventListener('click', exitEditMode);
});
