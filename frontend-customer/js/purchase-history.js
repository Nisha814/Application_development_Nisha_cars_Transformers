document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('purchase-table-body');

  // Initial Load
  fetchPurchases();

  async function fetchPurchases() {
    try {
      const purchases = await api.get('purchasehistory');
      
      if (purchases.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="color: var(--text-secondary); text-align: center; padding: 2rem;">No purchases found.</td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = purchases.map(item => {
        const rawTotal = item.unitPrice * item.quantity;
        const discountApplied = item.totalPrice < rawTotal;
        
        let totalDisplay = `<td style="font-weight: 600; color: var(--accent-primary);">$${item.totalPrice.toFixed(2)}</td>`;
        if (discountApplied) {
            totalDisplay = `
              <td>
                <div style="font-size: 0.75rem; text-decoration: line-through; color: var(--text-secondary);">$${rawTotal.toFixed(2)}</div>
                <div style="font-weight: 700; color: var(--status-success);">$${item.totalPrice.toFixed(2)}</div>
                <div style="font-size: 0.7rem; color: var(--status-success); margin-top: 2px;"><i data-lucide="award" style="width: 10px; height: 10px;"></i> 10% Loyalty Discount</div>
              </td>
            `;
        }

        return `
          <tr>
            <td>${new Date(item.purchaseDate).toLocaleDateString()}</td>
            <td style="font-weight: 600;">${item.itemName}</td>
            <td>
              <span class="badge badge-info" style="font-size: 0.75rem;">${item.category}</span>
            </td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            ${totalDisplay}
          </tr>
        `;
      }).join('');

      lucide.createIcons();
    } catch (error) {
      console.error("Failed to load purchase history:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="color: var(--status-danger); text-align: center; padding: 2rem;">Failed to load purchase records.</td>
        </tr>
      `;
    }
  }
});
