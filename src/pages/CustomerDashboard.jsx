import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalDashboard } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName') || 'Customer';
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPortalDashboard()
            .then(res => { setDashboard(res.data); setLoading(false); })
            .catch(() => { toast.error("Failed to load dashboard"); setLoading(false); });
    }, []);

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>My Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back, {fullName}!</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="activity-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px' }}>🚗</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{dashboard?.totalVehicles ?? 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Registered Vehicles</div>
                </div>
                <div className="activity-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/customer/payments')}>
                    <div style={{ fontSize: '32px' }}>💳</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: dashboard?.outstandingCredit > 0 ? '#ef4444' : '#22c55e' }}>
                        ${(dashboard?.outstandingCredit ?? 0).toFixed(2)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Outstanding Balance</div>
                </div>
                <div className="activity-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/customer/appointments')}>
                    <div style={{ fontSize: '32px' }}>📅</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{dashboard?.upcomingAppointments?.length ?? 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upcoming Appointments</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Recent Purchases */}
                <div className="activity-card">
                    <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        Recent Purchases
                        <button onClick={() => navigate('/customer/purchases')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>View All</button>
                    </h3>
                    {dashboard?.recentPurchases?.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No past purchases yet.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ color: '#64748b', textAlign: 'left' }}>
                                    <th style={{ padding: '8px 0' }}>Invoice</th>
                                    <th style={{ padding: '8px 0' }}>Date</th>
                                    <th style={{ padding: '8px 0' }}>Amount</th>
                                    <th style={{ padding: '8px 0' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard?.recentPurchases?.map(s => (
                                    <tr key={s.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px 0', fontWeight: '600' }}>#{s.id}</td>
                                        <td style={{ padding: '10px 0' }}>{new Date(s.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '10px 0', fontWeight: '600' }}>${s.totalAmount.toFixed(2)}</td>
                                        <td style={{ padding: '10px 0' }}>
                                            <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', background: s.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7', color: s.paymentStatus === 'Paid' ? '#166534' : '#b45309' }}>
                                                {s.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Upcoming Appointments */}
                <div className="activity-card">
                    <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        Upcoming Appointments
                        <button onClick={() => navigate('/customer/appointments')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Book New +</button>
                    </h3>
                    {dashboard?.upcomingAppointments?.length === 0 ? (
                        <p style={{ color: '#94a3b8' }}>No upcoming appointments.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {dashboard?.upcomingAppointments?.map(a => (
                                <div key={a.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ fontWeight: '600' }}>{a.serviceType}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(a.serviceDate).toLocaleDateString()} {a.vehicle ? `• ${a.vehicle}` : ''}</div>
                                    <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>{a.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginTop: '20px' }}>
                {[
                    { icon: '📅', label: 'Book Appointment', path: '/customer/appointments' },
                    { icon: '🔧', label: 'Request a Part', path: '/customer/requests' },
                    { icon: '⭐', label: 'Write a Review', path: '/customer/reviews' },
                    { icon: '📜', label: 'Service History', path: '/customer/service-history' },
                    { icon: '🛒', label: 'Purchases', path: '/customer/purchases' },
                    { icon: '💳', label: 'Payments', path: '/customer/payments' },
                    { icon: '🏢', label: 'Service Center', path: '/customer/service-center' },
                    { icon: '🔔', label: 'Notifications', path: '/customer/notifications' },
                    { icon: '👤', label: 'My Profile', path: '/profile' },
                ].map(item => (
                    <div key={item.path} className="activity-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '20px', transition: 'transform 0.2s' }}
                        onClick={() => navigate(item.path)}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default CustomerDashboard;
