import React, { useEffect, useState } from 'react';
import { getServiceHistory } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerServiceHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getServiceHistory()
            .then(res => setHistory(res.data || []))
            .catch(() => toast.error('Failed to load service history'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Service History</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Past and completed service appointments</p>
                </div>
            </div>
            <div className="activity-card">
                {loading ? <p>Loading...</p> : history.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No service history yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {history.map(h => (
                            <div key={h.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #22c55e' }}>
                                <div style={{ fontWeight: '600' }}>{h.serviceType}</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                    {new Date(h.serviceDate).toLocaleString()}{h.vehicle ? ` • ${h.vehicle}` : ''}
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534' }}>{h.status}</span>
                                {h.notes && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>{h.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerServiceHistory;
