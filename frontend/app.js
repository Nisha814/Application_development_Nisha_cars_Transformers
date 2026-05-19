// State Management
const state = {
    isAuthenticated: false,
    currentUser: null,
    activeTab: 'dashboard'
};

// UI Elements
const elements = {
    sidebar: document.getElementById('app-sidebar'),
    loginView: document.getElementById('view-login'),
    appContent: document.getElementById('app-content'),
    tabContentArea: document.getElementById('tab-content-area'),
    formLogin: document.getElementById('form-login'),
    loginError: document.getElementById('login-error'),
    btnLogout: document.getElementById('btn-logout'),
    userFullName: document.getElementById('user-fullname'),
    userRole: document.getElementById('user-role'),
    userAvatar: document.getElementById('user-avatar'),
    navItems: document.querySelectorAll('.nav-item')
};

// Mock Views for Initial Task
const views = {
    'admin-panel': `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800; display: flex; align-items: center; gap: 12px; font-family: var(--font-heading);">
                <i data-lucide="shield-check" style="color: var(--accent); width: 36px; height: 36px;"></i> Director Hub
            </h1>
            <p style="color: var(--text-secondary);">Restricted Area - Senior Director Administration & System Auditing.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 30px;" class="animate-fade-in">
            <div class="glass-card" style="display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="activity" style="color: var(--primary);"></i> Security Auditing Logs
                </h3>
                <div style="display: flex; flex-direction: column; gap: 12px;" id="security-logs">
                    <div style="padding: 12px 15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent); border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-muted); font-family: monospace;">[18:12:05]</span> 
                        <span><strong style="color: white;">Himal Magar (Director)</strong> logged in successfully from localhost.</span>
                    </div>
                    <div style="padding: 12px 15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--warning); border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-muted); font-family: monospace;">[18:14:48]</span> 
                        <span><strong style="color: var(--warning);">Fault-Tolerant Engine:</strong> Bypassed database exception & routed to offline failover.</span>
                    </div>
                    <div style="padding: 12px 15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--primary); border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-muted); font-family: monospace;">[18:14:50]</span> 
                        <span><strong style="color: white;">SMTP Mock Email Service:</strong> Transaction invoice successfully sent to customer.</span>
                    </div>
                    <div style="padding: 12px 15px; background: rgba(255,255,255,0.02); border-left: 3px solid var(--success); border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-muted); font-family: monospace;">[18:15:30]</span> 
                        <span><strong style="color: white;">Repayment Auditing:</strong> Balance repayment of $120.00 recorded successfully.</span>
                    </div>
                </div>

                <div style="margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 25px;">
                    <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="receipt" style="color: var(--accent); width: 20px; height: 20px;"></i> Repayment & Payment Audit History
                    </h3>
                    <div class="table-container">
                        <table class="modern-table" style="font-size: 0.8rem; margin: 0;">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Method</th>
                                    <th>Amount Paid</th>
                                    <th>Recorded By</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>05/18 14:30</td>
                                    <td style="color: white; font-weight: 600;">Liam Henderson</td>
                                    <td><span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 6px;">Cash</span></td>
                                    <td style="font-family: monospace; font-weight: 700; color: white;">$250.00</td>
                                    <td>Sarah Jenkins</td>
                                </tr>
                                <tr>
                                    <td>05/17 09:15</td>
                                    <td style="color: white; font-weight: 600;">Liam Henderson</td>
                                    <td><span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 6px;">Card</span></td>
                                    <td style="font-family: monospace; font-weight: 700; color: white;">$120.00</td>
                                    <td>Himal Magar</td>
                                </tr>
                                <tr>
                                    <td>05/15 11:45</td>
                                    <td style="color: white; font-weight: 600;">Sophia Martinez</td>
                                    <td><span class="badge badge-success" style="font-size: 0.65rem; padding: 2px 6px;">Cash</span></td>
                                    <td style="font-family: monospace; font-weight: 700; color: white;">$500.00</td>
                                    <td>Sarah Jenkins</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="glass-card" style="background: linear-gradient(135deg, rgba(139,92,246,0.03) 0%, rgba(236,72,153,0.03) 100%);">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="trending-up" style="color: var(--secondary);"></i> Corporate Goals
                    </h3>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
                            <span>Monthly Sales Target</span>
                            <span style="color: var(--secondary); font-family: monospace;">$15,240 / $20,000</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                            <div style="width: 76%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 4px;"></div>
                        </div>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">Active target is shared across all sales officers. Next update scheduled in 12 days.</p>
                </div>
                
                <div class="glass-card">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="sliders" style="color: var(--text-secondary); width: 16px; height: 16px;"></i> Director Settings
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Force Offline Failover</span>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" checked disabled style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: not-allowed; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--warning); border-radius: 24px; display: flex; align-items: center; justify-content: end; padding: 3px;"><div style="width: 18px; height: 18px; background-color: black; border-radius: 50%;"></div></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; opacity: 0.6;">
                            <span>Audit Security Mode</span>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" checked disabled style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: not-allowed; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--primary); border-radius: 24px; display: flex; align-items: center; justify-content: end; padding: 3px;"><div style="width: 18px; height: 18px; background-color: white; border-radius: 50%;"></div></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="glass-card" style="background: rgba(255,255,255,0.01); border-color: rgba(139, 92, 246, 0.15);">
                    <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="award" style="color: var(--warning);"></i> Sales Leaderboard
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.1rem;">🥇</span>
                                <div>
                                    <div style="font-weight: 600; color: white; font-size: 0.9rem;">Himal Magar</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Director | 14 Deals</div>
                                </div>
                            </div>
                            <span style="font-family: monospace; font-weight: 700; color: var(--primary);">$4,250.00</span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.1rem;">🥈</span>
                                <div>
                                    <div style="font-weight: 600; color: white; font-size: 0.9rem;">Sarah Jenkins</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Sales Officer | 8 Deals</div>
                                </div>
                            </div>
                            <span style="font-family: monospace; font-weight: 700; color: var(--secondary);">$2,120.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    dashboard: `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800;">Staff Dashboard</h1>
            <p style="color: var(--text-secondary);">Welcome to your main command center. Here is today's overview.</p>
        </div>
        
        <!-- Summary Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px;">
            <div class="glass-card" style="display: flex; align-items: center; gap: 20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                    <i data-lucide="dollar-sign"></i>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Today's Sales</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-top: 4px;" id="dash-today-sales">$1,240.50</div>
                </div>
            </div>
            
            <div class="glass-card" style="display: flex; align-items: center; gap: 20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
                    <i data-lucide="users"></i>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Registered Customers</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-top: 4px;">48</div>
                </div>
            </div>
            
            <div class="glass-card" style="display: flex; align-items: center; gap: 20px;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent);">
                    <i data-lucide="wallet"></i>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Active Credits</div>
                    <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-top: 4px;" id="dash-active-credits">$8,450.00</div>
                </div>
            </div>
        </div>
        
        <!-- Quick Action / Status Area -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
            <div class="glass-card">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="trending-up" style="color: var(--primary);"></i> Recent Transactions
                </h3>
                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                    <i data-lucide="activity" style="width: 48px; height: 48px; margin-bottom: 10px;"></i>
                    <p>No transactions registered yet. Complete a sale to see details.</p>
                </div>
            </div>
            
            <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3 style="margin-bottom: 15px;">Quick Actions</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 20px;">Launch common operational tasks instantly.</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="btn btn-primary" onclick="switchTab('billing')" style="width: 100%;">
                        <i data-lucide="shopping-cart" style="width: 16px; height: 16px;"></i> Create New Sale
                    </button>
                    <button class="btn btn-secondary" onclick="switchTab('customers')" style="width: 100%;">
                        <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i> Register Customer
                    </button>
                </div>
            </div>
        </div>
    `,
    customers: `
        <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="font-size: 2.2rem; font-weight: 800;">Customer Profiles</h1>
                <p style="color: var(--text-secondary);">Register and view accounts, details, and credit status.</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start;">
            <!-- Register Customer Card -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="user-plus" style="color: var(--primary);"></i> Add Customer
                </h3>
                <form id="form-register-customer">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" id="cust-name" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-input" id="cust-email" placeholder="john@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="text" class="form-input" id="cust-phone" placeholder="+1-555-0100" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-input" id="cust-address" placeholder="123 Maple St">
                    </div>
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label class="form-label">Initial Credit Limit ($)</label>
                        <input type="number" class="form-input" id="cust-limit" placeholder="1000.00" value="1000" min="0" step="100">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        Save Customer
                    </button>
                </form>
            </div>

            <!-- Customer Search / List Card -->
            <div class="glass-card" style="min-height: 520px;">
                <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center;">
                    <h3 style="white-space: nowrap;"><i data-lucide="search" style="color: var(--secondary); vertical-align: middle; margin-right: 8px;"></i> Search Registry</h3>
                    <input type="text" class="form-input" id="customer-search-input" placeholder="Type name, email, or phone to search..." style="padding: 10px 15px;">
                </div>

                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Credit Limit</th>
                                <th>Balance Owed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    vehicles: `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800;">Vehicle Registration</h1>
            <p style="color: var(--text-secondary);">Record vehicle details and associate them with customer accounts.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start;">
            <!-- Register Vehicle Card -->
            <div class="glass-card">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="plus-circle" style="color: var(--secondary);"></i> Add Vehicle
                </h3>
                <form id="form-register-vehicle">
                    <div class="form-group">
                        <label class="form-label">Select Customer Owner</label>
                        <select class="form-input" id="veh-customer" required>
                            <option value="">Select a customer...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Make</label>
                        <input type="text" class="form-input" id="veh-make" placeholder="e.g. Toyota" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Model</label>
                        <input type="text" class="form-input" id="veh-model" placeholder="e.g. Camry" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <input type="number" class="form-input" id="veh-year" placeholder="e.g. 2022" required min="1900" max="2030">
                    </div>
                    <div class="form-group">
                        <label class="form-label">License Plate</label>
                        <input type="text" class="form-input" id="veh-plate" placeholder="e.g. 7XYZ99" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label class="form-label">VIN (Chassis Number)</label>
                        <input type="text" class="form-input" id="veh-vin" placeholder="Enter VIN number">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        Register Vehicle
                    </button>
                </form>
            </div>

            <!-- Vehicle Search / List Card -->
            <div class="glass-card" style="min-height: 520px;">
                <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center;">
                    <h3 style="white-space: nowrap;"><i data-lucide="search" style="color: var(--primary); vertical-align: middle; margin-right: 8px;"></i> Search Vehicles</h3>
                    <input type="text" class="form-input" id="vehicle-search-input" placeholder="Search by model, make, or plate..." style="padding: 10px 15px;">
                </div>

                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Plate / VIN</th>
                                <th>Owner Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="vehicles-list">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    invoices: `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800; display: flex; align-items: center; gap: 12px; font-family: var(--font-heading);">
                <i data-lucide="receipt" style="color: var(--primary); width: 36px; height: 36px;"></i> Invoices Archive & Registry
            </h1>
            <p style="color: var(--text-secondary);">Browse, search, and reprint historic customer invoice records and receipts.</p>
        </div>

        <div class="glass-card" style="min-height: 500px;">
            <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center;">
                <h3 style="white-space: nowrap;"><i data-lucide="search" style="color: var(--secondary); vertical-align: middle; margin-right: 8px;"></i> Search Archive</h3>
                <input type="text" class="form-input" id="invoice-search-input" placeholder="Search by Invoice Number or Client Name..." style="padding: 10px 15px;" oninput="searchInvoices(this.value)">
            </div>

            <div class="table-container">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Invoice Number</th>
                            <th>Issued Date</th>
                            <th>Customer Name</th>
                            <th>Method</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="invoices-list-body">
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    `,
    billing: `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800;">Billing & Invoice Engine</h1>
            <p style="color: var(--text-secondary);">Process vehicle parts sales, calculate credits, and issue invoices instantly.</p>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: start;">
            <!-- Left Side: Cart & Item Form -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
                
                <!-- Add Item Form Card -->
                <div class="glass-card">
                    <h3 style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="plus-circle" style="color: var(--accent);"></i> Add Part to Cart
                        </span>
                        
                        <!-- Quick Catalog Select Dropdown -->
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 500;">
                            <span style="color: var(--text-secondary); font-weight: 600;">Quick Catalog:</span>
                            <select class="form-input" id="catalog-select" style="padding: 4px 10px; width: 220px; font-size: 0.8rem; border-color: rgba(255,255,255,0.08); height: 32px; background: rgba(0,0,0,0.25);" onchange="selectCatalogPart(this)">
                                <option value="">Custom Part (Type manually)...</option>
                                <option value="brake-kit">Disc Brake Kit ($250.00)</option>
                                <option value="coilover">Performance Coilover Kit ($899.99)</option>
                                <option value="air-filter">High-Performance Air Filter ($45.50)</option>
                                <option value="spoiler">Carbon Fiber Rear Spoiler ($320.00)</option>
                                <option value="oil">Synthetic Engine Oil 5W-30 ($59.95)</option>
                                <option value="exhaust">Titanium Exhaust Muffler ($649.00)</option>
                            </select>
                        </div>
                    </h3>
                    <form id="form-add-cart-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 15px; align-items: end;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Part Name / Description</label>
                            <input type="text" class="form-input" id="cart-part-name" placeholder="e.g. Brake Pads Front" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Part Number</label>
                            <input type="text" class="form-input" id="cart-part-number" placeholder="e.g. BP-8902" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Quantity</label>
                            <input type="number" class="form-input" id="cart-part-qty" placeholder="1" value="1" min="1" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Unit Price ($)</label>
                            <input type="number" class="form-input" id="cart-part-price" placeholder="0.00" min="0" step="0.01" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="height: 48px; padding: 0 20px;">
                            Add
                        </button>
                    </form>
                </div>

                <!-- Shopping Cart Card -->
                <div class="glass-card" style="min-height: 350px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="shopping-bag" style="color: var(--primary);"></i> Current Cart Items
                        </h3>
                        <div class="table-container">
                            <table class="modern-table">
                                <thead>
                                    <tr>
                                        <th>Part Details</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total Price</th>
                                        <th style="width: 80px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="cart-items-list">
                                    <!-- Dynamic Cart Items Injected Here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Cart Calculations -->
                    <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 20px; display: flex; justify-content: flex-end;">
                        <div style="width: 320px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-secondary);">
                                <span>Subtotal:</span>
                                <span id="cart-subtotal" style="font-family: monospace; font-weight: 600; color: white;">$0.00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; color: var(--text-secondary);">
                                <span>Discount ($):</span>
                                <input type="number" class="form-input" id="cart-discount" value="0" min="0" step="1" style="width: 100px; padding: 6px 10px; text-align: right; font-family: monospace;">
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; color: white; margin-bottom: 15px;">
                                <span>Net Total:</span>
                                <span id="cart-net-total" style="color: var(--primary); font-family: monospace;">$0.00</span>
                            </div>
                            
                            <button class="btn btn-primary" onclick="processCheckout()" style="width: 100%; height: 44px; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Complete Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Customer Search & Checkout -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
                
                <!-- Customer Pinned Card -->
                <div class="glass-card">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="user" style="color: var(--secondary);"></i> Pinned Customer
                    </h3>
                    
                    <!-- Search Input -->
                    <div style="position: relative; margin-bottom: 15px;">
                        <input type="text" class="form-input" id="billing-cust-search" placeholder="Search customer name..." style="padding-right: 35px;">
                        <i data-lucide="search" style="position: absolute; right: 12px; top: 14px; width: 16px; height: 16px; color: var(--text-muted);"></i>
                        
                        <!-- Auto-suggest drop results -->
                        <div id="billing-cust-results" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; max-height: 200px; overflow-y: auto; background: #12141d; border: 1px solid var(--border-color); border-radius: var(--radius-md); z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                            <!-- Results Injected Here -->
                        </div>
                    </div>

                    <!-- Display Pinned Info -->
                    <div id="pinned-customer-box" style="padding: 15px; border-radius: var(--radius-md); background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                        <i data-lucide="user-minus" style="width: 24px; height: 24px; margin-bottom: 5px; opacity: 0.5;"></i>
                        <p>No customer pinned. Defaults to Walk-in Cash Sale.</p>
                    </div>
                </div>

                <!-- Payment & Complete Card -->
                <div class="glass-card">
                    <h3 style="margin-bottom: 20px;">Checkout Details</h3>
                    
                    <div style="margin-bottom: 25px;">
                        <label class="form-label" style="margin-bottom: 10px;">Select Payment Method</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <button class="btn btn-secondary active-payment" id="pay-cash" onclick="selectPaymentMethod('Cash')" style="padding: 12px 5px; font-size: 0.85rem; border-color: var(--primary);">
                                <i data-lucide="banknote" style="width: 14px; height: 14px; vertical-align: middle;"></i> Cash
                            </button>
                            <button class="btn btn-secondary" id="pay-card" onclick="selectPaymentMethod('Card')" style="padding: 12px 5px; font-size: 0.85rem;">
                                <i data-lucide="credit-card" style="width: 14px; height: 14px; vertical-align: middle;"></i> Card
                            </button>
                            <button class="btn btn-secondary" id="pay-credit" onclick="selectPaymentMethod('Credit')" style="padding: 12px 5px; font-size: 0.85rem;">
                                <i data-lucide="wallet" style="width: 14px; height: 14px; vertical-align: middle;"></i> Credit
                            </button>
                        </div>
                    </div>

                    <!-- Credit limit check warning block -->
                    <div id="credit-check-error" style="display: none; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); color: var(--danger); font-size: 0.85rem; margin-bottom: 20px; font-weight: 500; text-align: center;">
                        <i data-lucide="alert-triangle" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i>
                        Credit Limit Exceeded
                    </div>

                    <button class="btn btn-primary" id="btn-complete-checkout" onclick="processCheckout()" style="width: 100%; height: 50px; font-size: 1.05rem;">
                        <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i> Complete Transaction
                    </button>
                </div>

            </div>
        </div>
    `,
    credits: `
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 2.2rem; font-weight: 800;">Credit Ledger & Repayments</h1>
            <p style="color: var(--text-secondary);">Manage active customer debt, accept credit payments, and view billing history.</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start;">
            <!-- Left Side: Repayment Form -->
            <div class="glass-card">
                <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="wallet" style="color: var(--warning);"></i> Collect Repayment
                </h3>
                <form id="form-credit-repayment">
                    <div class="form-group">
                        <label class="form-label">Select Customer</label>
                        <select class="form-input" id="credit-pay-customer" required>
                            <option value="">Select a debtor...</option>
                            <!-- Dynamic populated list of debtors -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Payment Amount ($)</label>
                        <input type="number" class="form-input" id="credit-pay-amount" placeholder="0.00" min="0.01" step="0.01" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label class="form-label">Payment Method</label>
                        <select class="form-input" id="credit-pay-method" required>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; height: 48px;">
                        <i data-lucide="check-circle" style="width: 16px; height: 16px; margin-right: 8px;"></i> Process Payment
                    </button>
                </form>
            </div>

            <!-- Right Side: Credit Ledgers Table -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="glass-card" style="min-height: 400px;">
                    <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="users" style="color: var(--primary);"></i> Active Credit Ledgers
                    </h3>
                    <div class="table-container">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Outstanding Bal</th>
                                    <th>Avail Credit</th>
                                    <th>Total Limit</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="credits-list">
                                <!-- Dynamic Credits Info Injected Here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Live Nested Customer Purchase History & Invoices Panel -->
                <div class="glass-card" id="credit-history-panel" style="display: none;">
                    <!-- Customer Details and Table of Invoices Injected Here on selection -->
                </div>
            </div>
        </div>
    `
};

// Local In-Memory Database Fallbacks
const mockCustomers = [
    { id: 1, fullName: 'Liam Henderson', email: 'liam.h@example.com', phoneNumber: '+1-555-0199', address: '742 Evergreen Terrace, Springfield', totalCreditLimit: 2000.00, currentBalance: 450.00, createdAt: new Date().toISOString() },
    { id: 2, fullName: 'Sophia Martinez', email: 'sophia.m@example.com', phoneNumber: '+1-555-0143', address: '104 Main Street, Boston', totalCreditLimit: 1500.00, currentBalance: 0.00, createdAt: new Date().toISOString() }
];

const mockVehicles = [
    { id: 1, customerId: 1, customerName: 'Liam Henderson', make: 'Toyota', model: 'RAV4', year: 2021, licensePlate: '5XYZ89', vin: '1N4AL3AP5KC123456' },
    { id: 2, customerId: 2, customerName: 'Sophia Martinez', make: 'Honda', model: 'Civic', year: 2019, licensePlate: '9ABC12', vin: '1N4AL3AP5KC987654' }
];

const mockSales = [
    {
        id: 10123,
        customerId: 1,
        staffName: 'Alexander Wright',
        customerName: 'Liam Henderson',
        customerEmail: 'liam.h@example.com',
        customerPhone: '+1-555-0199',
        customerAddress: '742 Evergreen Terrace, Springfield',
        saleDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        totalAmount: 500.00,
        discount: 50.00,
        netAmount: 450.00,
        paymentMethod: 'Credit',
        status: 'Pending',
        invoiceNumber: 'INV-2026-10123',
        items: [
            { id: 1, partName: 'Disc Brake Kit', partNumber: 'DBK-1002', quantity: 2, unitPrice: 250.00, totalPrice: 500.00 }
        ]
    }
];

// Switch Tab logic
function switchTab(tabId) {
    if (!state.isAuthenticated) return;
    
    state.activeTab = tabId;
    
    // Update navigation active states
    elements.navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Load active view template
    elements.tabContentArea.innerHTML = views[tabId] || '';
    
    // Trigger tab-specific loads
    if (tabId === 'customers') {
        loadCustomers();
    } else if (tabId === 'vehicles') {
        loadVehicles();
    } else if (tabId === 'credits') {
        loadCredits();
        
        // Dynamic Role Adjustment: Lock repayment forms for non-director staff members
        const isDirector = state.currentUser && (state.currentUser.role.toLowerCase().includes('director') || state.currentUser.role.toLowerCase().includes('admin'));
        const repaymentForm = document.getElementById('form-credit-repayment');
        if (repaymentForm) {
            if (!isDirector) {
                repaymentForm.style.opacity = '0.45';
                repaymentForm.style.cursor = 'not-allowed';
                repaymentForm.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
                
                const submitBtn = repaymentForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i data-lucide="lock" style="width: 16px; height: 16px; margin-right: 8px;"></i> Requires Director Auth';
                    submitBtn.className = 'btn btn-secondary';
                    submitBtn.style.cursor = 'not-allowed';
                }
            }
        }
    } else if (tabId === 'dashboard') {
        // Dynamic Role Adjustment: Lock sensitive metrics for non-director staff members on Dashboard
        const isDirector = state.currentUser && (state.currentUser.role.toLowerCase().includes('director') || state.currentUser.role.toLowerCase().includes('admin'));
        if (!isDirector) {
            const todaySales = document.getElementById('dash-today-sales');
            const activeCredits = document.getElementById('dash-active-credits');
            
            if (todaySales) {
                todaySales.innerHTML = '<span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="lock" style="width: 14px; height: 14px;"></i> Restricted</span>';
            }
            if (activeCredits) {
                activeCredits.innerHTML = '<span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="lock" style="width: 14px; height: 14px;"></i> Restricted</span>';
            }
        }
    } else if (tabId === 'invoices') {
        loadInvoices();
    }
    
    // Refresh icons since we are dynamically loading new elements
    lucide.createIcons();
}

// Invoices Archive & Retrieval Engine
window.loadInvoices = async function(searchVal = '') {
    const listBody = document.getElementById('invoices-list-body');
    if (!listBody) return;
    
    listBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Fetching invoice records...</td></tr>`;
    
    let sales = [];
    try {
        const response = await fetch(`${API_BASE}/sales`);
        if (!response.ok) throw new Error('API Error');
        sales = await response.json();
    } catch (err) {
        console.warn('API offline. Loading historic sales records via mock DB.');
        sales = [...mockSales];
    }
    
    // Sort sales by date descending (latest first)
    sales.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
    
    if (searchVal.trim() !== '') {
        const q = searchVal.toLowerCase();
        sales = sales.filter(s => 
            s.invoiceNumber.toLowerCase().includes(q) || 
            (s.customerName && s.customerName.toLowerCase().includes(q))
        );
    }
    
    if (sales.length === 0) {
        listBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No invoice records found matching your search.</td></tr>`;
        return;
    }
    
    listBody.innerHTML = sales.map(s => {
        const formattedDate = new Date(s.saleDate).toLocaleString();
        const clientName = s.customerName || 'Walk-in Customer';
        const finalAmount = s.netAmount !== undefined ? s.netAmount : s.totalAmount;
        return `
            <tr>
                <td>
                    <div style="font-family: monospace; font-weight: 700; color: white; font-size: 0.95rem;">${s.invoiceNumber}</div>
                </td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${formattedDate}</td>
                <td>
                    <div style="font-weight: 600; color: white;">${clientName}</div>
                </td>
                <td>
                    <span class="badge ${s.paymentMethod.toLowerCase() === 'credit' ? 'badge-warning' : 'badge-success'}" style="font-size: 0.75rem;">
                        ${s.paymentMethod}
                    </span>
                </td>
                <td style="font-family: monospace; font-weight: 600; color: white;">$${parseFloat(finalAmount).toFixed(2)}</td>
                <td>
                    <span class="badge ${s.status.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.75rem;">
                        ${s.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;" onclick="viewInvoiceFromArchive(${s.id})">
                        <i data-lucide="eye" style="width: 12px; height: 12px; vertical-align: middle;"></i> View Invoice
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    lucide.createIcons();
};

window.searchInvoices = function(val) {
    window.loadInvoices(val);
};

window.viewInvoiceFromArchive = async function(id) {
    try {
        const response = await fetch(`${API_BASE}/sales/${id}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        showInvoice(data);
    } catch (err) {
        const match = mockSales.find(s => s.id === id);
        if (match) {
            showInvoice(match);
        } else {
            alert('Invoice record not found.');
        }
    }
};

// Fetch Customers List (with fallback)
async function loadCustomers(searchVal = '') {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;
    
    listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading customers...</td></tr>`;
    
    try {
        const url = searchVal ? `${API_BASE}/customers?search=${encodeURIComponent(searchVal)}` : `${API_BASE}/customers`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        renderCustomersList(data);
    } catch (err) {
        console.warn('Customers fetch failed. Reading from offline mock database.');
        const filtered = mockCustomers.filter(c => 
            !searchVal || 
            c.fullName.toLowerCase().includes(searchVal.toLowerCase()) || 
            c.email.toLowerCase().includes(searchVal.toLowerCase()) || 
            c.phoneNumber.includes(searchVal)
        );
        renderCustomersList(filtered);
    }
}

function renderCustomersList(customers) {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;
    
    if (customers.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No customers found.</td></tr>`;
        return;
    }
    
    listBody.innerHTML = customers.map(c => `
        <tr>
            <td style="font-weight: 600; color: white;">${c.fullName}</td>
            <td>
                <div style="font-size: 0.9rem;">${c.email}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${c.phoneNumber}</div>
            </td>
            <td style="font-family: monospace; font-weight: 600; color: var(--secondary);">$${parseFloat(c.totalCreditLimit).toFixed(2)}</td>
            <td>
                <span class="badge ${parseFloat(c.currentBalance) > 0 ? 'badge-warning' : 'badge-success'}">
                    $${parseFloat(c.currentBalance).toFixed(2)}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="viewCustomerHistory(${c.id})">
                    <i data-lucide="history" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i> History
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

// Fetch Vehicles List (with fallback)
async function loadVehicles(searchVal = '') {
    const listBody = document.getElementById('vehicles-list');
    if (!listBody) return;
    
    listBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading vehicles...</td></tr>`;
    
    // Dynamically populate owner select options too!
    populateOwnerSelect();
    
    try {
        const url = searchVal ? `${API_BASE}/vehicles?search=${encodeURIComponent(searchVal)}` : `${API_BASE}/vehicles`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        renderVehiclesList(data);
    } catch (err) {
        console.warn('Vehicles fetch failed. Reading from offline mock database.');
        const filtered = mockVehicles.filter(v => 
            !searchVal || 
            v.make.toLowerCase().includes(searchVal.toLowerCase()) || 
            v.model.toLowerCase().includes(searchVal.toLowerCase()) || 
            v.licensePlate.toLowerCase().includes(searchVal.toLowerCase())
        );
        renderVehiclesList(filtered);
    }
}

function renderVehiclesList(vehicles) {
    const listBody = document.getElementById('vehicles-list');
    if (!listBody) return;
    
    if (vehicles.length === 0) {
        listBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No vehicles registered.</td></tr>`;
        return;
    }
    
    listBody.innerHTML = vehicles.map(v => `
        <tr>
            <td>
                <div style="font-weight: 600; color: white;">${v.year} ${v.make} ${v.model}</div>
            </td>
            <td>
                <div style="font-family: monospace; font-size: 0.9rem; color: var(--primary); font-weight: 600;">${v.licensePlate}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">VIN: ${v.vin || 'N/A'}</div>
            </td>
            <td>${v.customerName || 'Unknown Owner'}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="switchTab('billing')">
                    <i data-lucide="shopping-cart" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i> Service Sale
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

// Populate vehicle owner dropdown list
async function populateOwnerSelect() {
    const select = document.getElementById('veh-customer');
    if (!select) return;
    
    // Clear keeping first placeholder
    select.innerHTML = '<option value="">Select a customer...</option>';
    
    try {
        const response = await fetch(`${API_BASE}/customers`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        data.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.fullName} (${c.phoneNumber})</option>`;
        });
    } catch (err) {
        mockCustomers.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.fullName} (${c.phoneNumber})</option>`;
        });
    }
}

// Global Event Interceptor for form submissions and dynamic inputs
document.addEventListener('input', (e) => {
    if (e.target.id === 'customer-search-input') {
        loadCustomers(e.target.value);
    } else if (e.target.id === 'vehicle-search-input') {
        loadVehicles(e.target.value);
    } else if (e.target.id === 'billing-cust-search') {
        const val = e.target.value;
        const suggestBox = document.getElementById('billing-cust-results');
        if (!suggestBox) return;
        
        if (val.trim().length === 0) {
            suggestBox.style.display = 'none';
            return;
        }
        
        fetch(`${API_BASE}/customers?search=${encodeURIComponent(val)}`)
            .then(res => res.json())
            .then(data => renderBillingCustomerSuggestions(data))
            .catch(() => {
                const filtered = mockCustomers.filter(c => c.fullName.toLowerCase().includes(val.toLowerCase()));
                renderBillingCustomerSuggestions(filtered);
            });
    } else if (e.target.id === 'cart-discount') {
        calculateTotals();
    }
});

document.addEventListener('submit', async (e) => {
    // Register Customer Form Submission
    if (e.target.id === 'form-register-customer') {
        e.preventDefault();
        
        const payload = {
            fullName: document.getElementById('cust-name').value,
            email: document.getElementById('cust-email').value,
            phoneNumber: document.getElementById('cust-phone').value,
            address: document.getElementById('cust-address').value,
            initialCreditLimit: parseFloat(document.getElementById('cust-limit').value || 1000)
        };
        
        try {
            const response = await fetch(`${API_BASE}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                showSuccessNotification('Customer registered successfully!');
                loadCustomers();
                e.target.reset();
            } else {
                if (response.status === 500 || response.status === 503 || response.status === 504) {
                    throw new Error('Database Offline');
                }
                alert('Failed to register customer via API.');
            }
        } catch (err) {
            console.warn('API offline. Registering customer to mock data.');
            
            // Add to mock in-memory DB
            const newCustomer = {
                id: mockCustomers.length + 1,
                fullName: payload.fullName,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                address: payload.address,
                totalCreditLimit: payload.initialCreditLimit,
                currentBalance: 0.00,
                createdAt: new Date().toISOString()
            };
            mockCustomers.push(newCustomer);
            
            showSuccessNotification('Customer registered successfully (Offline Mode)!');
            loadCustomers();
            e.target.reset();
        }
    }
    
    // Register Vehicle Form Submission
    else if (e.target.id === 'form-register-vehicle') {
        e.preventDefault();
        
        const custSelect = document.getElementById('veh-customer');
        const payload = {
            customerId: parseInt(custSelect.value),
            make: document.getElementById('veh-make').value,
            model: document.getElementById('veh-model').value,
            year: parseInt(document.getElementById('veh-year').value),
            licensePlate: document.getElementById('veh-plate').value,
            vin: document.getElementById('veh-vin').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/vehicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                showSuccessNotification('Vehicle registered successfully!');
                loadVehicles();
                e.target.reset();
            } else {
                if (response.status === 500 || response.status === 503 || response.status === 504) {
                    throw new Error('Database Offline');
                }
                alert('Failed to register vehicle via API.');
            }
        } catch (err) {
            console.warn('API offline. Registering vehicle to mock data.');
            
            // Find owner name in mock customers
            const owner = mockCustomers.find(c => c.id === payload.customerId);
            const ownerName = owner ? owner.fullName : 'Unknown Owner';
            
            const newVehicle = {
                id: mockVehicles.length + 1,
                customerId: payload.customerId,
                customerName: ownerName,
                make: payload.make,
                model: payload.model,
                year: payload.year,
                licensePlate: payload.licensePlate,
                vin: payload.vin
            };
            mockVehicles.push(newVehicle);
            
            showSuccessNotification('Vehicle registered successfully (Offline Mode)!');
            loadVehicles();
            e.target.reset();
        }
    }
    
    // Add Item to Shopping Cart Form Submission
    else if (e.target.id === 'form-add-cart-item') {
        e.preventDefault();
        
        const partItem = {
            partName: document.getElementById('cart-part-name').value,
            partNumber: document.getElementById('cart-part-number').value,
            quantity: parseInt(document.getElementById('cart-part-qty').value),
            unitPrice: parseFloat(document.getElementById('cart-part-price').value)
        };
        
        window.billingCart.push(partItem);
        renderCart();
        
        // Reset item fields keeping quantity at 1
        document.getElementById('cart-part-name').value = '';
        document.getElementById('cart-part-number').value = '';
        document.getElementById('cart-part-price').value = '';
        document.getElementById('cart-part-qty').value = '1';
        
        showSuccessNotification('Item added to cart.');
    }
    
    // Collect Balance Repayment Form Submission
    else if (e.target.id === 'form-credit-repayment') {
        e.preventDefault();
        
        const customerId = parseInt(document.getElementById('credit-pay-customer').value);
        const amount = parseFloat(document.getElementById('credit-pay-amount').value);
        const method = document.getElementById('credit-pay-method').value;
        
        const payload = {
            customerId: customerId,
            paymentAmount: amount,
            paymentMethod: method
        };
        
        try {
            const response = await fetch(`${API_BASE}/credits/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                showSuccessNotification('Repayment processed successfully!');
                loadCredits();
                e.target.reset();
                
                // Hide active credit history panel since ledger balances changed
                document.getElementById('credit-history-panel').style.display = 'none';
            } else {
                if (response.status === 500 || response.status === 503 || response.status === 504) {
                    throw new Error('Database Offline');
                }
                const txt = await response.text();
                alert(`Error processing repayment: ${txt}`);
            }
        } catch (err) {
            console.warn('API offline. Recording repayment locally in mock DB.');
            
            const cust = mockCustomers.find(c => c.id === customerId);
            if (cust) {
                cust.currentBalance -= amount;
                if (cust.currentBalance < 0) cust.currentBalance = 0;
                
                // If debt paid off, update mock pending sales to Paid
                if (cust.currentBalance === 0) {
                    mockSales.forEach(s => {
                        if (s.customerId === customerId && s.status === 'Pending') {
                            s.status = 'Paid';
                        }
                    });
                }
                
                showSuccessNotification('Repayment processed successfully (Offline Mode)!');
                loadCredits();
                e.target.reset();
                document.getElementById('credit-history-panel').style.display = 'none';
            } else {
                alert('Debtor customer profile not found.');
            }
        }
    }
});

function showSuccessNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius-md);
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: fadeIn 0.4s ease-out;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

window.viewCustomerHistory = function(customerId) {
    // Switch to credits tab
    switchTab('credits');
    
    // Find customer details from mock or API
    const match = mockCustomers.find(c => c.id === customerId);
    const name = match ? match.fullName : `Customer #${customerId}`;
    
    // Set a tiny timeout to ensure credits tab is fully initialized, then load history panel!
    setTimeout(() => {
        viewCreditHistory(customerId, name);
    }, 100);
};

const API_BASE = 'http://localhost:5276/api';

// Initial Page Render / Login logic
elements.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    elements.loginError.style.display = 'none';
    
    // Instant Fallback: If default seeder credentials, bypass network entirely and log in in 0ms!
    if ((username === 'admin' && password === 'admin123') || (username === 'staff' && password === 'staff123')) {
        console.warn('Direct offline authentication route triggered.');
        const isDefaultAdmin = username === 'admin';
        signIn(
            isDefaultAdmin ? 'Himal Magar' : 'Sarah Jenkins',
            isDefaultAdmin ? 'Senior Sales Director' : 'Sales Officer',
            isDefaultAdmin ? 'HM' : 'SJ',
            true
        );
        return;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                signIn(data.user.fullName, data.user.role, data.user.fullName.split(' ').map(n => n[0]).join(''));
                return;
            }
        }
    } catch (err) {
        console.warn('API network error or connection timeout.');
    }
    
    // Global Fallback: If login failed for any reason (401 invalid, 500 database offline, 404 router, or timeout)
    // but they entered the correct default seeder credentials, log them in instantly!
    if ((username === 'admin' && password === 'admin123') || (username === 'staff' && password === 'staff123')) {
        console.warn('Database auth unsuccessful. Gracefully transitioning to local offline demo mode.');
        const isDefaultAdmin = username === 'admin';
        signIn(
            isDefaultAdmin ? 'Himal Magar' : 'Sarah Jenkins',
            isDefaultAdmin ? 'Senior Sales Director' : 'Sales Officer',
            isDefaultAdmin ? 'HM' : 'SJ',
            true
        );
        return;
    }
    
    elements.loginError.innerText = 'Database Auth: Invalid username or password.';
    elements.loginError.style.display = 'block';
});

// Toggle password visibility
const btnTogglePassword = document.getElementById('toggle-password');
if (btnTogglePassword) {
    btnTogglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('login-password');
        const eyeIcon = btnTogglePassword.querySelector('[data-lucide]');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            btnTogglePassword.innerHTML = '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>';
        } else {
            passwordInput.type = 'password';
            btnTogglePassword.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
        }
        
        lucide.createIcons();
    });
}

function signIn(fullName, role, initials, isDemo = false) {
    state.isAuthenticated = true;
    state.currentUser = { fullName, role, avatar: initials };
    
    elements.userFullName.innerText = state.currentUser.fullName;
    elements.userRole.innerText = state.currentUser.role + (isDemo ? ' (Offline)' : '');
    elements.userAvatar.innerText = state.currentUser.avatar;
    
    // Role-Based Access Control (RBAC): Show Director Panel ONLY for Directors / Admins
    const navAdminPanel = document.getElementById('nav-admin-panel');
    if (navAdminPanel) {
        if (role.toLowerCase().includes('director') || role.toLowerCase().includes('admin')) {
            navAdminPanel.style.display = 'block';
        } else {
            navAdminPanel.style.display = 'none';
        }
    }
    
    if (isDemo) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--warning);
            color: black;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: fadeIn 0.4s ease-out;
        `;
        toast.innerText = 'Running in Local Offline Demo Mode';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
    
    elements.loginView.style.display = 'none';
    elements.sidebar.style.display = 'flex';
    elements.appContent.style.display = 'block';
    
    switchTab('dashboard');
}

// Logout Event
elements.btnLogout.addEventListener('click', () => {
    state.isAuthenticated = false;
    state.currentUser = null;
    
    // Clear login inputs
    document.getElementById('login-password').value = '';
    elements.loginError.style.display = 'none';
    
    // Toggle Views back
    elements.loginView.style.display = 'block';
    elements.sidebar.style.display = 'none';
    elements.appContent.style.display = 'none';
});

// Add tab click events
elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
    });
});

// Interactive Billing Operations & Calculations
window.billingCart = [];
window.pinnedCustomer = null;
window.selectedPaymentMethod = 'Cash';

window.selectCatalogPart = function(elem) {
    const part = elem.value;
    const nameInput = document.getElementById('cart-part-name');
    const numInput = document.getElementById('cart-part-number');
    const priceInput = document.getElementById('cart-part-price');
    
    if (!nameInput || !numInput || !priceInput) return;
    
    if (part === 'brake-kit') {
        nameInput.value = 'Disc Brake Kit';
        numInput.value = 'DBK-1002';
        priceInput.value = '250.00';
    } else if (part === 'coilover') {
        nameInput.value = 'Performance Coilover Kit';
        numInput.value = 'PCK-3005';
        priceInput.value = '899.99';
    } else if (part === 'air-filter') {
        nameInput.value = 'High-Performance Air Filter';
        numInput.value = 'HAF-7088';
        priceInput.value = '45.50';
    } else if (part === 'spoiler') {
        nameInput.value = 'Carbon Fiber Rear Spoiler';
        numInput.value = 'CFS-9912';
        priceInput.value = '320.00';
    } else if (part === 'oil') {
        nameInput.value = 'Synthetic Engine Oil 5W-30';
        numInput.value = 'SEO-5W30';
        priceInput.value = '59.95';
    } else if (part === 'exhaust') {
        nameInput.value = 'Titanium Exhaust Muffler';
        numInput.value = 'TEM-4040';
        priceInput.value = '649.00';
    } else {
        nameInput.value = '';
        numInput.value = '';
        priceInput.value = '';
    }
};

window.selectPaymentMethod = function(method) {
    window.selectedPaymentMethod = method;
    
    // Toggle active state classes on the buttons
    const btnCash = document.getElementById('pay-cash');
    const btnCard = document.getElementById('pay-card');
    const btnCredit = document.getElementById('pay-credit');
    
    if (btnCash) btnCash.style.borderColor = (method === 'Cash') ? 'var(--primary)' : 'var(--border-color)';
    if (btnCard) btnCard.style.borderColor = (method === 'Card') ? 'var(--primary)' : 'var(--border-color)';
    if (btnCredit) btnCredit.style.borderColor = (method === 'Credit') ? 'var(--primary)' : 'var(--border-color)';
    
    validateCreditLimit();
};

window.removeCartItem = function(index) {
    window.billingCart.splice(index, 1);
    renderCart();
};

window.closeInvoiceModal = function() {
    const modal = document.getElementById('invoice-modal');
    if (modal) modal.style.display = 'none';
};

window.printInvoice = function() {
    window.print();
};

function renderCart() {
    const listBody = document.getElementById('cart-items-list');
    if (!listBody) return;
    
    if (window.billingCart.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Your shopping cart is empty. Add parts above to start.</td></tr>`;
        document.getElementById('cart-subtotal').innerText = '$0.00';
        document.getElementById('cart-net-total').innerText = '$0.00';
        return;
    }
    
    listBody.innerHTML = window.billingCart.map((item, idx) => `
        <tr>
            <td style="color: white; font-weight: 500;">
                <div>${item.partName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">PN: ${item.partNumber}</div>
            </td>
            <td>${item.quantity}</td>
            <td style="font-family: monospace;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
            <td style="font-family: monospace; font-weight: 600; color: white;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px; border-radius: 50%; color: var(--danger);" onclick="removeCartItem(${idx})">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
    calculateTotals();
}

function calculateTotals() {
    const subtotal = window.billingCart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountInput = document.getElementById('cart-discount');
    const discount = discountInput ? parseFloat(discountInput.value || 0) : 0;
    const netTotal = Math.max(0, subtotal - discount);
    
    const elSub = document.getElementById('cart-subtotal');
    const elNet = document.getElementById('cart-net-total');
    
    if (elSub) elSub.innerText = `$${subtotal.toFixed(2)}`;
    if (elNet) elNet.innerText = `$${netTotal.toFixed(2)}`;
    
    validateCreditLimit();
}

function validateCreditLimit() {
    const errorBlock = document.getElementById('credit-check-error');
    if (!errorBlock) return;
    
    if (window.selectedPaymentMethod !== 'Credit') {
        errorBlock.style.display = 'none';
        return;
    }
    
    const subtotal = window.billingCart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountInput = document.getElementById('cart-discount');
    const discount = discountInput ? parseFloat(discountInput.value || 0) : 0;
    const netTotal = Math.max(0, subtotal - discount);
    
    if (!window.pinnedCustomer) {
        errorBlock.style.display = 'block';
        errorBlock.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Pinned Customer Required`;
        lucide.createIcons();
        return;
    }
    
    const availableCredit = window.pinnedCustomer.totalCreditLimit - window.pinnedCustomer.currentBalance;
    if (netTotal > availableCredit) {
        errorBlock.style.display = 'block';
        errorBlock.innerHTML = `<i data-lucide="alert-triangle" style="width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 5px;"></i> Credit limit exceeded! Available: $${availableCredit.toFixed(2)}`;
        lucide.createIcons();
    } else {
        errorBlock.style.display = 'none';
    }
}

function renderBillingCustomerSuggestions(customers) {
    const box = document.getElementById('billing-cust-results');
    if (!box) return;
    
    if (customers.length === 0) {
        box.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.9rem; text-align: center;">No matches found</div>`;
        box.style.display = 'block';
        return;
    }
    
    box.innerHTML = customers.map(c => `
        <div style="padding: 10px 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03); transition: all var(--transition-fast);" 
             class="suggest-item" 
             onclick="pinCustomer(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            <div style="font-weight: 600; color: white;">${c.fullName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Phone: ${c.phoneNumber} | Limit Available: $${(c.totalCreditLimit - c.currentBalance).toFixed(2)}</div>
        </div>
    `).join('');
    
    box.style.display = 'block';
}

window.pinCustomer = function(customer) {
    window.pinnedCustomer = customer;
    
    const suggestBox = document.getElementById('billing-cust-results');
    if (suggestBox) suggestBox.style.display = 'none';
    
    const searchInput = document.getElementById('billing-cust-search');
    if (searchInput) searchInput.value = customer.fullName;
    
    const box = document.getElementById('pinned-customer-box');
    if (box) {
        const availableCredit = customer.totalCreditLimit - customer.currentBalance;
        box.style.borderColor = 'var(--primary)';
        box.style.background = 'rgba(139, 92, 246, 0.05)';
        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="text-align: left;">
                    <div style="font-weight: 700; color: white;">${customer.fullName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${customer.email}</div>
                </div>
                <button class="btn btn-secondary" onclick="unpinCustomer()" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px; color: var(--danger);">
                    Unpin
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 8px; font-size: 0.8rem; text-align: left;">
                <div>
                    <span style="color: var(--text-secondary);">Owed Bal:</span>
                    <span style="font-family: monospace; font-weight: 700; color: var(--warning); display: block;">$${parseFloat(customer.currentBalance).toFixed(2)}</span>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">Avail Limit:</span>
                    <span style="font-family: monospace; font-weight: 700; color: var(--accent); display: block;">$${availableCredit.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    validateCreditLimit();
};

window.unpinCustomer = function() {
    window.pinnedCustomer = null;
    
    const searchInput = document.getElementById('billing-cust-search');
    if (searchInput) searchInput.value = '';
    
    const box = document.getElementById('pinned-customer-box');
    if (box) {
        box.innerHTML = `
            <i data-lucide="user-minus" style="width: 24px; height: 24px; margin-bottom: 5px; opacity: 0.5;"></i>
            <p>No customer pinned. Defaults to Walk-in Cash Sale.</p>
        `;
        box.style.borderColor = 'var(--border-color)';
        box.style.background = 'rgba(255,255,255,0.02)';
    }
    
    validateCreditLimit();
    lucide.createIcons();
};

window.processCheckout = async function() {
    if (window.billingCart.length === 0) {
        alert('Cannot process an empty cart.');
        return;
    }
    
    if (window.selectedPaymentMethod === 'Credit' && !window.pinnedCustomer) {
        alert('Credit sales require a pinned customer account.');
        return;
    }
    
    const subtotal = window.billingCart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountInput = document.getElementById('cart-discount');
    const discount = discountInput ? parseFloat(discountInput.value || 0) : 0;
    
    // Role-Based Business Audit: Restrict Sales Officers to a maximum discount of $50.00
    const isDirector = state.currentUser && (state.currentUser.role.toLowerCase().includes('director') || state.currentUser.role.toLowerCase().includes('admin'));
    if (!isDirector && discount > 50) {
        alert('Discount Authorization Limit Exceeded!\n\nRegular Sales Officers are restricted to a maximum discount authority of $50.00. Larger discounts require Senior Director override authorization. Please log in as a Director to complete this sale.');
        return;
    }
    
    const netTotal = Math.max(0, subtotal - discount);
    
    if (window.selectedPaymentMethod === 'Credit') {
        const availableCredit = window.pinnedCustomer.totalCreditLimit - window.pinnedCustomer.currentBalance;
        if (netTotal > availableCredit) {
            alert('Checkout declined. Total amount exceeds the customer\'s remaining credit limit.');
            return;
        }
    }
    
    // Prepare API checkout payload
    const payload = {
        staffId: 1, // Default to Alexander Wright
        customerId: window.pinnedCustomer ? window.pinnedCustomer.id : null,
        discount: discount,
        paymentMethod: window.selectedPaymentMethod,
        items: window.billingCart.map(item => ({
            partName: item.partName,
            partNumber: item.partNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice
        }))
    };
    
    try {
        const response = await fetch(`${API_BASE}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            showSuccessNotification('Transaction completed successfully!');
            showInvoice(data);
            resetBillingCart();
        } else {
            if (response.status === 500 || response.status === 503 || response.status === 504) {
                throw new Error('Database Offline');
            }
            const text = await response.text();
            alert(`Checkout Error: ${text}`);
        }
    } catch (err) {
        console.warn('API offline. Processing transaction via local mock db.');
        
        const mockInvoiceId = Math.floor(Math.random() * 90000) + 10000;
        const invoiceNum = `INV-${new Date().getFullYear()}-${mockInvoiceId}`;
        
        if (window.selectedPaymentMethod === 'Credit' && window.pinnedCustomer) {
            const customerInMock = mockCustomers.find(c => c.id === window.pinnedCustomer.id);
            if (customerInMock) {
                customerInMock.currentBalance += netTotal;
            }
        }
        
        const mockResponse = {
            id: mockInvoiceId,
            staffName: state.currentUser ? state.currentUser.fullName : 'Himal Magar',
            customerName: window.pinnedCustomer ? window.pinnedCustomer.fullName : 'Walk-in Customer',
            customerEmail: window.pinnedCustomer ? window.pinnedCustomer.email : 'walkin@example.com',
            customerPhone: window.pinnedCustomer ? window.pinnedCustomer.phoneNumber : 'N/A',
            customerAddress: window.pinnedCustomer ? window.pinnedCustomer.address : 'N/A',
            saleDate: new Date().toISOString(),
            totalAmount: subtotal,
            discount: discount,
            netAmount: netTotal,
            paymentMethod: window.selectedPaymentMethod,
            status: window.selectedPaymentMethod === 'Credit' ? 'Pending' : 'Paid',
            invoiceNumber: invoiceNum,
            items: window.billingCart.map((item, idx) => ({
                id: idx + 1,
                partName: item.partName,
                partNumber: item.partNumber,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
            }))
        };
        
        mockSales.push(mockResponse);
        
        showSuccessNotification('Transaction completed successfully (Offline Mode)!');
        showInvoice(mockResponse);
        resetBillingCart();
    }
};

function resetBillingCart() {
    window.billingCart = [];
    window.pinnedCustomer = null;
    window.selectedPaymentMethod = 'Cash';
    renderCart();
    
    const inputSearch = document.getElementById('billing-cust-search');
    if (inputSearch) inputSearch.value = '';
    
    const pinnedBox = document.getElementById('pinned-customer-box');
    if (pinnedBox) {
        pinnedBox.innerHTML = `
            <i data-lucide="user-minus" style="width: 24px; height: 24px; margin-bottom: 5px; opacity: 0.5;"></i>
            <p>No customer pinned. Defaults to Walk-in Cash Sale.</p>
        `;
        pinnedBox.style.borderColor = 'var(--border-color)';
        pinnedBox.style.background = 'rgba(255,255,255,0.02)';
    }
    
    lucide.createIcons();
}

function showInvoice(data) {
    const modal = document.getElementById('invoice-modal');
    const modalContent = document.getElementById('invoice-modal-content');
    if (!modal || !modalContent) return;
    
    const formattedDate = new Date(data.saleDate).toLocaleString();
    const customerEmail = data.customerEmail || (window.pinnedCustomer ? window.pinnedCustomer.email : 'walkin@example.com');
    const customerPhone = data.customerPhone || (window.pinnedCustomer ? window.pinnedCustomer.phoneNumber : 'N/A');
    const customerAddress = data.customerAddress || (window.pinnedCustomer ? window.pinnedCustomer.address : 'N/A');
    
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; margin-bottom: 25px;">
            <div>
                <h1 style="font-size: 2rem; font-weight: 800; color: white; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="wrench" style="color: var(--primary);"></i> Nisha Cars Transformers
                </h1>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">Staff & Sales Invoice Engine</p>
            </div>
            <div style="text-align: right;">
                <span class="badge ${data.status.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.85rem; padding: 6px 14px;">
                    ${data.status}
                </span>
                <div style="font-family: monospace; font-size: 1.1rem; font-weight: 700; color: white; margin-top: 8px;">${data.invoiceNumber}</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; font-size: 0.95rem;">
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Client Details</h4>
                <div style="font-weight: 700; color: white; font-size: 1.1rem; margin-bottom: 4px;">${data.customerName}</div>
                <div style="color: var(--text-secondary);">${customerEmail}</div>
                <div style="color: var(--text-secondary);">${customerPhone}</div>
                <div style="color: var(--text-secondary); font-style: italic; margin-top: 4px;">Address: ${customerAddress}</div>
            </div>
            <div style="text-align: right;">
                <h4 style="color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Invoice Metadata</h4>
                <div style="color: white; font-weight: 500;">Date Issued: <span style="font-weight: 400; color: var(--text-secondary);">${formattedDate}</span></div>
                <div style="color: white; font-weight: 500; margin-top: 4px;">Payment Method: <span style="font-weight: 600; color: var(--secondary);">${data.paymentMethod}</span></div>
                <div style="color: white; font-weight: 500; margin-top: 4px;">Issued By: <span style="font-weight: 400; color: var(--text-secondary);">${data.staffName || 'Himal Magar'}</span></div>
            </div>
        </div>

        <h4 style="color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">Billed Products & Services</h4>
        <table class="modern-table" style="margin-top: 0; margin-bottom: 30px;">
            <thead>
                <tr>
                    <th>Part Name & Number</th>
                    <th style="width: 80px; text-align: center;">Qty</th>
                    <th style="width: 120px; text-align: right;">Unit Price</th>
                    <th style="width: 120px; text-align: right;">Total Price</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td style="color: white;">
                            <span style="font-weight: 600;">${item.partName}</span>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">PN: ${item.partNumber}</div>
                        </td>
                        <td style="text-align: center; font-weight: 500;">${item.quantity}</td>
                        <td style="text-align: right; font-family: monospace;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                        <td style="text-align: right; font-family: monospace; font-weight: 600; color: white;">$${parseFloat(item.totalPrice).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: end; border-top: 1px solid var(--border-color); padding-top: 25px;">
            <div>
                <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 320px;">
                    Thank you for choosing Nisha Cars Transformers! Under credit sales agreements, outstanding balances are due within 30 calendar days.
                </p>
            </div>
            <div style="width: 280px; display: flex; flex-direction: column; gap: 10px; font-size: 0.95rem;">
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                    <span>Gross Subtotal:</span>
                    <span style="font-family: monospace; font-weight: 600; color: white;">$${parseFloat(data.totalAmount).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                    <span>Discount Deducted:</span>
                    <span style="font-family: monospace; font-weight: 600; color: var(--danger);">$${parseFloat(data.discount).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; color: white;">
                    <span>Net Amount Due:</span>
                    <span style="font-family: monospace; color: var(--primary);">$${parseFloat(data.netAmount).toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 40px; display: flex; gap: 15px; justify-content: flex-end;" class="no-print">
            <button class="btn btn-secondary" onclick="closeInvoiceModal()">
                <i data-lucide="x" style="width: 16px; height: 16px; vertical-align: middle;"></i> Close Preview
            </button>
            <button class="btn btn-primary" onclick="printInvoice()">
                <i data-lucide="printer" style="width: 16px; height: 16px; vertical-align: middle;"></i> Print Invoice
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
    lucide.createIcons();
}

window.loadCredits = async function() {
    const listBody = document.getElementById('credits-list');
    if (!listBody) return;
    
    listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading active ledgers...</td></tr>`;
    
    try {
        const response = await fetch(`${API_BASE}/credits`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        
        renderCreditsTable(data);
        populateCreditsSelect(data);
    } catch (err) {
        console.warn('API offline. Loading credits via local mock DB.');
        
        // Map mockCustomers to mimic CreditResponseDto
        const mapped = mockCustomers.map(c => ({
            customerId: c.id,
            customerName: c.fullName,
            totalCreditLimit: c.totalCreditLimit,
            currentBalance: c.currentBalance,
            availableLimit: c.totalCreditLimit - c.currentBalance,
            lastUpdated: new Date().toISOString()
        }));
        
        renderCreditsTable(mapped);
        populateCreditsSelect(mapped);
    }
};

function renderCreditsTable(credits) {
    const listBody = document.getElementById('credits-list');
    if (!listBody) return;
    
    if (credits.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No credit ledgers registered.</td></tr>`;
        return;
    }
    
    listBody.innerHTML = credits.map(c => `
        <tr>
            <td>
                <div style="font-weight: 600; color: white;">${c.customerName}</div>
            </td>
            <td>
                <div style="font-family: monospace; font-weight: 700; color: ${c.currentBalance > 0 ? 'var(--warning)' : 'var(--accent)'};">
                    $${parseFloat(c.currentBalance).toFixed(2)}
                </div>
            </td>
            <td>
                <div style="font-family: monospace; font-weight: 600; color: white;">$${parseFloat(c.availableLimit).toFixed(2)}</div>
            </td>
            <td>
                <div style="font-family: monospace; color: var(--text-secondary); font-size: 0.9rem;">$${parseFloat(c.totalCreditLimit).toFixed(2)}</div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="viewCreditHistory(${c.customerId}, '${c.customerName.replace(/'/g, "\\'")}')">
                    <i data-lucide="history" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;"></i> View History
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function populateCreditsSelect(credits) {
    const selectPay = document.getElementById('credit-pay-customer');
    if (!selectPay) return;
    
    selectPay.innerHTML = '<option value="">Select a debtor...</option>';
    
    // Only allow selecting customers with active outstanding debt!
    const debtors = credits.filter(c => c.currentBalance > 0);
    debtors.forEach(d => {
        selectPay.innerHTML += `<option value="${d.customerId}">${d.customerName} (Owes: $${parseFloat(d.currentBalance).toFixed(2)})</option>`;
    });
}

window.viewCreditHistory = async function(customerId, customerName) {
    const panel = document.getElementById('credit-history-panel');
    if (!panel) return;
    
    panel.style.display = 'block';
    panel.innerHTML = `
        <h3 style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="history" style="color: var(--accent);"></i> Purchase History: ${customerName}
            </span>
            <button class="btn btn-secondary" onclick="document.getElementById('credit-history-panel').style.display = 'none'" style="padding: 4px 10px; font-size: 0.75rem;">
                <i data-lucide="x" style="width: 12px; height: 12px; vertical-align: middle;"></i> Hide
            </button>
        </h3>
        
        <div class="table-container">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th>Invoice / Date</th>
                        <th>Billed Parts</th>
                        <th>Method</th>
                        <th>Debt Status</th>
                        <th>Net Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="credit-history-list">
                    <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Fetching transactions...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    lucide.createIcons();
    
    const historyList = document.getElementById('credit-history-list');
    if (!historyList) return;
    
    try {
        const response = await fetch(`${API_BASE}/sales/customer/${customerId}`);
        if (!response.ok) throw new Error('API Error');
        const sales = await response.json();
        
        renderHistoryRows(sales);
    } catch (err) {
        console.warn('API offline. Loading sales history via mock DB.');
        const filtered = mockSales.filter(s => s.customerId === customerId);
        renderHistoryRows(filtered);
    }
};

function renderHistoryRows(sales) {
    const historyList = document.getElementById('credit-history-list');
    if (!historyList) return;
    
    if (sales.length === 0) {
        historyList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No transaction records found for this customer.</td></tr>`;
        return;
    }
    
    historyList.innerHTML = sales.map(s => {
        const dateStr = new Date(s.saleDate).toLocaleDateString();
        const invoiceNum = s.invoiceNumber || `INV-MOCK-${s.id}`;
        
        // Compile parts summary text
        const partsSummary = s.items.map(item => `${item.partName} (x${item.quantity})`).join(', ');
        
        return `
            <tr>
                <td>
                    <div style="font-weight: 700; color: white;">${invoiceNum}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${dateStr}</div>
                </td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem;" title="${partsSummary}">
                    ${partsSummary}
                </td>
                <td>
                    <span style="font-weight: 600; color: var(--secondary); font-size: 0.85rem;">${s.paymentMethod}</span>
                </td>
                <td>
                    <span class="badge ${s.status.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.7rem; padding: 3px 8px;">
                        ${s.status}
                    </span>
                </td>
                <td>
                    <div style="font-family: monospace; font-weight: 700; color: white;">$${parseFloat(s.netAmount).toFixed(2)}</div>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 6px;" onclick='viewHistoricalInvoice(${JSON.stringify(s).replace(/"/g, '&quot;')})'>
                        <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    lucide.createIcons();
}

window.viewHistoricalInvoice = function(sale) {
    showInvoice(sale);
};
