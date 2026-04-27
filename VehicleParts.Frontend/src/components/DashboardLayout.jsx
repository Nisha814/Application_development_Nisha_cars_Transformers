import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5026';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const fullName = localStorage.getItem('fullName') || 'Admin';
    const email = localStorage.getItem('email') || 'admin@vehicleparts.com';
    const profilePictureUrl = localStorage.getItem('profilePictureUrl');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin-dashboard', icon: '📊' },
        { name: 'Staff', path: '/admin/staff', icon: '👥' },
        { name: 'Customers', path: '/admin/customers', icon: '🤝' },
        { name: 'Vendors', path: '/admin/vendors', icon: '🏢' },
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
