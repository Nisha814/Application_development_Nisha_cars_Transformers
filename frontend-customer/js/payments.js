document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('payment-table-body');
  const outstandingBalEl = document.getElementById('outstanding-balance');
  const totalPaidEl = document.getElementById('total-paid');
  const alertContainer = document.getElementById('alert-container');

  let allPayments = [];

  // Initial Load
  fetchPayments();

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

  async function fetchPayments() {
    try {
      const payments = await api.get('payment');
      allPayments = payments;
      
      // Calculate summary stats
      let outstanding = 0;
      let totalPaid = 0;

      payments.forEach(p => {
        if (p.status === 'Pending' || p.status === 'Overdue') {
          outstanding += p.amount;
        } else if (p.status === 'Paid') {
          totalPaid += p.amount;
        }
      });

      outstandingBalEl.textContent = `$${outstanding.toFixed(2)}`;
      totalPaidEl.textContent = `$${totalPaid.toFixed(2)}`;

      if (payments.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="color: var(--text-secondary); text-align: center; padding: 2rem;">No invoices or payments found.</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = payments.map(item => {
        let badgeClass = 'badge-pending';
        let isPaid = item.status === 'Paid';
        
        if (item.status === 'Paid') badgeClass = 'badge-success';
        else if (item.status === 'Overdue') badgeClass = 'badge-danger';

        return `
          <tr>
            <td style="font-weight: 600;">${item.description}</td>
            <td>${new Date(item.dueDate).toLocaleDateString()}</td>
            <td style="font-weight: 600; color: var(--accent-primary);">$${item.amount.toFixed(2)}</td>
            <td>
              <span class="badge ${badgeClass}" style="font-size: 0.75rem;">${item.status}</span>
            </td>
            <td>${item.paidAt ? new Date(item.paidAt).toLocaleDateString() : '—'}</td>
            <td>
              ${!isPaid ? `
                <button class="btn btn-primary pay-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" data-id="${item.id}">
                  <i data-lucide="credit-card" style="width: 14px; margin-top: 1px;"></i> Pay Now
                </button>
              ` : `
                <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" disabled>
                  <i data-lucide="check" style="width: 14px;"></i> Paid
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');

      // Custom modal references
      const modal = document.getElementById('payment-confirm-modal');
      const modalText = document.getElementById('payment-confirm-text');
      const modalConfirmBtn = document.getElementById('payment-confirm-btn');
      const modalCancelBtn = document.getElementById('payment-cancel-btn');

      // Add payment action listeners
      document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const btnEl = e.currentTarget;
          const id = parseInt(btnEl.getAttribute('data-id'));
          const payment = allPayments.find(p => p.id === id);
          if (!payment) return;

          const desc = payment.description;
          const amount = payment.amount.toFixed(2);

          // Show custom in-app modal
          modalText.innerHTML = `Are you sure you want to pay <strong style="color: var(--accent-primary);">$${amount}</strong> for:<br><em>"${desc}"</em>?`;
          modal.style.display = 'flex';
          lucide.createIcons();

          // Remove old listeners to prevent duplicates
          const newConfirmBtn = modalConfirmBtn.cloneNode(true);
          modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);

          const newCancelBtn = modalCancelBtn.cloneNode(true);
          modalCancelBtn.parentNode.replaceChild(newCancelBtn, modalCancelBtn);

          // Cancel button closes the modal
          newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
          });

          // Confirm button processes the payment
          newConfirmBtn.addEventListener('click', async () => {
            modal.style.display = 'none';
            try {
              btnEl.disabled = true;
              btnEl.innerHTML = '<i class="spinner"></i> Processing...';
              
              await api.post(`payment/${id}/pay`, {});
              showAlert(`Payment of $${amount} successfully captured.`, 'success');
              
              fetchPayments();
            } catch (err) {
              showAlert(err.message || 'Payment failed.');
              btnEl.disabled = false;
              btnEl.innerHTML = `<i data-lucide="credit-card" style="width: 14px; margin-top: 1px;"></i> Pay Now`;
              lucide.createIcons();
            }
          });
        });
      });

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to load payments list:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="color: var(--status-danger); text-align: center; padding: 2rem;">Failed to load invoices.</td>
        </tr>
      `;
    }
  }
});
