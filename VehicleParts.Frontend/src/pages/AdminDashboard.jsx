import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview, getParts } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalCustomers: 0,
        totalVendors: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        systemStatus: 'Operational'
    });
    const [lowStockParts, setLowStockParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fullName = sessionStorage.getItem('fullName') || 'Admin';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, partsRes] = await Promise.all([
                    getDashboardOverview(),
                    getParts()
                ]);
                setStats(statsRes.data);
                
                // Automatically filter low stock parts (< 10 units)
                const lowStock = partsRes.data.filter(p => p.stockQuantity < 10);
                setLowStockParts(lowStock);
                
                setLoading(false);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/unauthorized');
                } else {
                    setError("Failed to load dashboard data");
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading dashboard data...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back, {fullName}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '13px', background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontWeight: '600' }}>
                        🟢 Admin Access
                    </span>
                </div>
            </header>

            {error && <div className="message error">{error}</div>}

            {/* System Low Stock Automated Notifications (< 10 units) */}
            {lowStockParts.length > 0 && (
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
                            Automated Low Stock Notifications ({"<"} 10 units left)
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {lowStockParts.map(part => (
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
                                📦 {part.partName} (SKU: {part.sku}) - <strong style={{ color: '#ef4444' }}>{part.stockQuantity} remaining</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="modern-stats-grid">
                <div className="modern-stat-card">
                    <div className="stat-label">Total Staff <span>👥</span></div>
                    <div className="stat-value">{stats.totalStaff}</div>
                    <div className="stat-trend trend-up">Live Data</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Total Vendors <span>🏢</span></div>
                    <div className="stat-value">{stats.totalVendors}</div>
                    <div className="stat-trend trend-up">Live Data</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Customers <span>👤</span></div>
                    <div className="stat-value">{stats.totalCustomers}</div>
                    <div className="stat-trend trend-up">Live Data</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Pending Verifications <span>⏳</span></div>
                    <div className="stat-value">{stats.pendingApprovals}</div>
                    <div className="stat-trend" style={{ color: '#f59e0b' }}>Needs Attention</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">Active Accounts <span>⚡</span></div>
                    <div className="stat-value">{stats.activeUsers}</div>
                    <div className="stat-trend trend-up">System Wide</div>
                </div>
                <div className="modern-stat-card">
                    <div className="stat-label">System Status <span>✅</span></div>
                    <div className="stat-value" style={{ fontSize: '20px', marginTop: '8px' }}>{stats.systemStatus}</div>
                </div>
            </div>

            {/* Activity Section */}
            <div className="activity-section">
                <div className="activity-card">
                    <div className="card-title">
                        Login Activity
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '11px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>System Performance</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        {[35, 42, 30, 45, 40, 50, 32].map((height, i) => (
                            <div key={i} className="bar-wrapper">
                                <div className="bar" style={{ height: `${height * 3}px` }}></div>
                                <span className="bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="activity-card">
                    <div className="card-title">
                        Recent Activity
                        <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>Real-time Feed</span>
                    </div>
                    <div className="feed-list">
                        <div className="feed-item">
                            <div className="feed-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🛡️</div>
                            <div className="feed-info">
                                <p>Admin session started successfully.</p>
                                <span className="time">Just now</span>
                            </div>
                        </div>
                        <div className="feed-item">
                            <div className="feed-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>👥</div>
                            <div className="feed-info">
                                <p>Database synchronization complete.</p>
                                <span className="time">2 mins ago</span>
                            </div>
                        </div>
                        <div className="feed-item" style={{ border: 'none' }}>
                            <div className="feed-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>⚙️</div>
                            <div className="feed-info">
                                <p><b>System</b> automated backup completed.</p>
                                <span className="time">Today, 07:45 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <div className="action-card" onClick={() => navigate('/admin/staff')}>
                    <span style={{ fontSize: '24px' }}>👥</span>
                    <h4>Staff List</h4>
                    <p>Manage your employees</p>
                </div>
                <div className="action-card" onClick={() => navigate('/admin/customers')}>
                    <span style={{ fontSize: '24px' }}>🤝</span>
                    <h4>Customer List</h4>
                    <p>View registered clients</p>
                </div>
                <div className="action-card" onClick={() => navigate('/admin/vendors')}>
                    <span style={{ fontSize: '24px' }}>🏢</span>
                    <h4>Vendors</h4>
                    <p>Supplier management</p>
                </div>
                <div className="action-card" onClick={() => navigate('/profile')}>
                    <span style={{ fontSize: '24px' }}>👤</span>
                    <h4>My Profile</h4>
                    <p>Update your information</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
