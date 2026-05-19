document.addEventListener('DOMContentLoaded', () => {
  const centersGrid = document.getElementById('centers-grid');
  const searchInput = document.getElementById('center-search');
  const serviceFilter = document.getElementById('service-filter');

  let allCenters = [];

  fetchServiceCenters();

  // Search & Filter event listeners
  searchInput.addEventListener('input', renderCenters);
  serviceFilter.addEventListener('change', renderCenters);

  async function fetchServiceCenters() {
    try {
      const centers = await fetch('http://localhost:5156/api/servicecenter').then(r => r.json());
      allCenters = centers;

      // Populate service filter dropdown from available services
      const allServices = new Set();
      centers.forEach(c => {
        if (c.servicesOffered) {
          c.servicesOffered.split(',').forEach(s => allServices.add(s.trim()));
        }
      });

      allServices.forEach(service => {
        const option = document.createElement('option');
        option.value = service;
        option.textContent = service;
        serviceFilter.appendChild(option);
      });

      renderCenters();
      lucide.createIcons();
    } catch (error) {
      console.error("Failed to load service centers:", error);
      centersGrid.innerHTML = `<p style="color: var(--status-danger);">Failed to load service centers. Please try again later.</p>`;
    }
  }

  function renderCenters() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedService = serviceFilter.value;

    const filtered = allCenters.filter(center => {
      // Text search match
      const matchesSearch = !query ||
        center.name.toLowerCase().includes(query) ||
        center.address.toLowerCase().includes(query) ||
        (center.servicesOffered && center.servicesOffered.toLowerCase().includes(query)) ||
        (center.phone && center.phone.includes(query)) ||
        (center.email && center.email.toLowerCase().includes(query));

      // Service filter match
      const matchesService = !selectedService ||
        (center.servicesOffered && center.servicesOffered.split(',').map(s => s.trim()).includes(selectedService));

      return matchesSearch && matchesService;
    });

    if (filtered.length === 0) {
      centersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">No service centers match your search.</p>
          <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="document.getElementById('center-search').value=''; document.getElementById('service-filter').value=''; renderCenters();">Clear Filters</button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    centersGrid.innerHTML = filtered.map(center => {
      const services = center.servicesOffered
        ? center.servicesOffered.split(',').map(s => {
          const svc = s.trim();
          const isHighlighted = selectedService && svc === selectedService;
          return `<span class="service-tag" style="${isHighlighted ? 'background: rgba(30,144,255,0.25); border-color: var(--accent-primary); font-weight: 700;' : ''}">${svc}</span>`;
        }).join('')
        : '<span style="color: var(--text-secondary);">No services listed</span>';

      const now = new Date();
      const day = now.getDay();
      const hours = center.operatingHours || '';
      const isSunday = day === 0;
      const includesSun = hours.toLowerCase().includes('sun');
      const isLikelyOpen = !isSunday || includesSun;

      return `
        <div class="center-card">
          <div class="center-header">
            <div class="center-icon">
              <i data-lucide="wrench" style="width: 26px; height: 26px; color: white;"></i>
            </div>
            <div style="flex-grow: 1;">
              <div class="center-name">${center.name}</div>
              <div style="margin-top: 0.35rem;">
                <span class="status-badge">
                  <span class="pulse-dot"></span> ${isLikelyOpen ? 'Open Now' : 'Closed Today'}
                </span>
              </div>
            </div>
          </div>

          <div class="info-row">
            <i data-lucide="map-pin"></i>
            <div>
              <div class="info-label">Address</div>
              <div class="info-value">${center.address}</div>
            </div>
          </div>

          <div class="info-row">
            <i data-lucide="phone"></i>
            <div>
              <div class="info-label">Phone</div>
              <div class="info-value">${center.phone}</div>
            </div>
          </div>

          <div class="info-row">
            <i data-lucide="mail"></i>
            <div>
              <div class="info-label">Email</div>
              <div class="info-value">${center.email}</div>
            </div>
          </div>

          <div class="info-row">
            <i data-lucide="clock"></i>
            <div>
              <div class="info-label">Operating Hours</div>
              <div class="info-value">${center.operatingHours}</div>
            </div>
          </div>

          <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06);">
            <div class="info-label" style="margin-bottom: 0.5rem;">Services Offered</div>
            <div class="services-list">
              ${services}
            </div>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  }

  // Expose renderCenters for the clear button
  window.renderCenters = renderCenters;
});
