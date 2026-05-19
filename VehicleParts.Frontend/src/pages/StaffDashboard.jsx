import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParts, getVendors, getInvoices } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [parts, setParts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fullName = sessionStorage.getItem('fullName') || 'Staff Member';

    useEffect(() => {
        const fetchStaffDashboardData = async () => {
            try {
                const [partsRes, vendorsRes, invoicesRes] = await Promise.all([
                    getParts(),
                    getVendors(),
                    getInvoices()
                ]);
                setParts(partsRes.data);
                setVendors(vendorsRes.data);
                setInvoices(invoicesRes.data);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to load staff dashboard metrics");
                setLoading(false);
            }
        };

        fetchStaffDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ padding: '40px' }}>
                    <h2>Loading Staff Dashboard Metrics...</h2>
                </div>
            </DashboardLayout>
        );
    }

    // Calculated metrics
    const totalParts = parts.length;
    const outOfStockParts = parts.filter(p => p.stockQuantity === 0).length;
    const lowStockParts = parts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
    const totalVendors = vendors.length;
    const totalInvoices = invoices.length;

    // Filter low stock warnings list (< 10 units)
    const lowStockWarnings = parts.filter(p => p.stockQuantity < 10);

    return (
        <DashboardLayout>
            <header className="dashboard-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Staff Operations Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back, {fullName} | Manage inventory catalog and record invoice restocks</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '13px', background: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>
                        🛡️ Staff Member Access
                    </span>
                </div>
            </header>

            {/* Low Stock Alerts */}
            {lowStockWarnings.length > 0 && (
                <div style={{ 
                    background: '#fffbeb', 
                    border: '1px solid #fef3c7', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    marginBottom: '32px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}>⚠️</span>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#b45309', margin: 0 }}>
                            Low Stock Warnings ({"<"} 10 units left)
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {lowStockWarnings.map(part => (
                            <div 
                                key={part.id} 
                                style={{ 
                                    background: 'white', 
                                    border: '1px solid #fde68a', 
                                    padding: '8px 14px', 
                                    borderRadius: '8px', 
                                    fontSize: '12px', 
                                    fontWeight: '600', 
                                    color: '#78350f' 
                                }}
                            >
                                📦 {part.partName} - <strong style={{ color: '#ef4444' }}>{part.stockQuantity} units left</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="modern-stats-grid" style={{ marginBottom: '32px' }}>
                <div className="modern-stat-card">
                    <div className="stat-label">Stock Catalog Items <span>⚙️</span></div>
                    <div className="stat-value">{totalParts}</div>
                    <div className="stat-trend trend-up">Active Catalog</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Out of Stock Parts <span>❌</span></div>
                    <div className="stat-value" style={{ color: outOfStockParts > 0 ? '#ef4444' : '#22c55e' }}>{outOfStockParts}</div>
                    <div className="stat-trend" style={{ color: outOfStockParts > 0 ? '#ef4444' : '#22c55e' }}>
                        {outOfStockParts > 0 ? 'Needs Ingestion' : 'All Catalog Instock'}
                    </div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Low Stock (≤ 5 units) <span>⚠️</span></div>
                    <div className="stat-value" style={{ color: lowStockParts > 0 ? '#f59e0b' : '#22c55e' }}>{lowStockParts}</div>
                    <div className="stat-trend" style={{ color: lowStockParts > 0 ? '#f59e0b' : '#22c55e' }}>
                        {lowStockParts > 0 ? 'Requires attention' : 'Catalog healthy'}
                    </div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Supplier Vendors <span>🏢</span></div>
                    <div className="stat-value">{totalVendors}</div>
                    <div className="stat-trend trend-up">Registered Partners</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Invoices Ingested <span>🧾</span></div>
                    <div className="stat-value">{totalInvoices}</div>
                    <div className="stat-trend trend-up">Purchase Transactions</div>
                </div>
            </div>

            {/* Quick action grid */}
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Operations Quick Links</h3>
            <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="action-card" onClick={() => navigate('/admin/parts')} style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '24px' }}>⚙️</span>
                    <h4>Manage Inventory</h4>
                    <p>View & update vehicle parts</p>
                </div>
                <div className="action-card" onClick={() => navigate('/admin/invoices')} style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '24px' }}>🧾</span>
                    <h4>Record Invoices</h4>
                    <p>Purchase stock from suppliers</p>
                </div>
                <div className="action-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '24px' }}>👤</span>
                    <h4>My Profile</h4>
                    <p>Update profile details & credentials</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffDashboard;
