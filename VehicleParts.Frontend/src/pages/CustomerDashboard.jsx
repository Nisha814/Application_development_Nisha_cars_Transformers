import React from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="auth-container" style={{ maxWidth: '800px' }}>
            <div className="management-header">
                <div>
                    <h2>My Account</h2>
                    <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>View your orders and profile</p>
                </div>
                <button onClick={() => navigate('/profile')} style={{ width: 'auto', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                    My Profile
                </button>
            </div>
            
            <div className="message success">Welcome to Vehicle Parts Store</div>

            <div className="auth-footer" style={{ marginTop: '40px' }}>
                <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    Logout Securely
                </button>
            </div>
        </div>
    );
};

export default CustomerDashboard;
