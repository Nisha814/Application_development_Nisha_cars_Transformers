import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/api';

const API_BASE_URL = 'http://localhost:5026';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const fullName = sessionStorage.getItem('fullName') || 'Admin';
    const email = sessionStorage.getItem('email') || 'admin@vehicleparts.com';
    const profilePictureUrl = sessionStorage.getItem('profilePictureUrl');
    const role = sessionStorage.getItem('role') || 'Admin';

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (e) {
            console.error("Logout API failed", e);
        }
        sessionStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: role === 'Admin' ? '/admin-dashboard' : role === 'Staff' ? '/staff-dashboard' : '/customer-dashboard', icon: '📊' },
        { name: 'Parts Inventory', path: '/admin/parts', icon: '⚙️' },
        { name: 'Purchase Invoices', path: '/admin/invoices', icon: '🧾' },
        ...(role === 'Admin' ? [
            { name: 'Staff', path: '/admin/staff', icon: '👥' },
            { name: 'Customers', path: '/admin/customers', icon: '🤝' },
            { name: 'Vendors', path: '/admin/vendors', icon: '🏢' },
            { name: 'Financial Reports', path: '/admin/reports', icon: '📊' }
        ] : []),
        { name: 'Profile', path: '/profile', icon: '👤' },
    ];

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '6px' }}>VP</span>
                    AdminCore
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <div 
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span>{item.icon}</span> {item.name}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-small">
                        {profilePictureUrl ? (
                            <img 
                                src={`${API_BASE_URL}${profilePictureUrl}`} 
                                alt="User" 
                                style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="avatar">{fullName[0]}</div>
                        )}
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{fullName}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{ marginTop: '16px', background: 'transparent', color: '#ef4444', border: 'none', padding: 0, fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                        Logout Account
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
