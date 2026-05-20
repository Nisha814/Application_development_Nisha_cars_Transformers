import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        getNotifications()
            .then(res => {
                const data = res.data;
                const items = Array.isArray(data) ? data : (data?.items || []);
                setNotifications(items);
            })
            .catch(() => toast.error('Failed to load notifications'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            load();
        } catch {
            toast.error('Failed to update notification');
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Notifications</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Updates about appointments, requests, and payments</p>
                </div>
            </div>
            <div className="activity-card">
                {loading ? <p>Loading...</p> : notifications.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No notifications yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{ padding: '14px', background: n.isRead ? '#f8fafc' : '#eff6ff', borderRadius: '8px', borderLeft: `3px solid ${n.isRead ? '#cbd5e1' : 'var(--primary)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <strong style={{ display: 'block' }}>{n.title}</strong>
                                        <p style={{ margin: '6px 0', color: '#64748b', fontSize: '14px' }}>{n.message}</p>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                    {!n.isRead && (
                                        <button onClick={() => handleMarkRead(n.id)} className="auth-button" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerNotifications;
