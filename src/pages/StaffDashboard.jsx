import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName') || 'Staff Member';

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Staff Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back, {fullName}! Manage sales and customers.</p>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="activity-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/staff/billing')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>New Sale / POS</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Create new invoices and process payments.</p>
                </div>

                <div className="activity-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin/customers')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤝</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Register Customer</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Add new customers and register their vehicles.</p>
                </div>

                <div className="activity-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/staff/customer-history')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📜</div>
                    <h3 style={{ margin: '0 0 10px 0' }}>Customer History</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Look up past purchases and outstanding credits.</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StaffDashboard;
