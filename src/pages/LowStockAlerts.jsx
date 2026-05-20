import React, { useEffect, useState } from 'react';
import { getStockAlerts, resolveStockAlert } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const LowStockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showResolved, setShowResolved] = useState(false);

    const load = () => {
        setLoading(true);
        getStockAlerts(!showResolved)
            .then(res => setAlerts(res.data || []))
            .catch(() => toast.error('Failed to load alerts'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [showResolved]);

    const handleResolve = async (id) => {
        try {
            await resolveStockAlert(id);
            toast.success('Alert resolved');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to resolve alert');
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Low Stock Alerts</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monitor and resolve inventory alerts</p>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
                    <span style={{ fontSize: 14 }}>Show resolved alerts</span>
                </label>
            </div>

            <div className="activity-card">
                {loading ? <p>Loading...</p> : alerts.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>{showResolved ? 'No alerts found.' : 'No active alerts. Inventory levels are healthy!'}</p>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {alerts.map(a => (
                            <div key={a.id} style={{
                                padding: 16, borderRadius: 8,
                                background: a.alertType === 'OutOfStock' ? '#fef2f2' : '#fffbeb',
                                borderLeft: `4px solid ${a.alertType === 'OutOfStock' ? '#ef4444' : '#f59e0b'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <strong style={{ fontSize: 16 }}>{a.partName}</strong>
                                        <span style={{ marginLeft: 10, padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 'bold',
                                            background: a.alertType === 'OutOfStock' ? '#fee2e2' : '#fef3c7',
                                            color: a.alertType === 'OutOfStock' ? '#b91c1c' : '#b45309' }}>
                                            {a.alertType === 'OutOfStock' ? 'OUT OF STOCK' : 'LOW STOCK'}
                                        </span>
                                        <p style={{ margin: '8px 0 4px', color: '#64748b' }}>{a.message}</p>
                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                            Qty: {a.currentQuantity} / Threshold: {a.threshold} • {new Date(a.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    {!a.isResolved && (
                                        <button onClick={() => handleResolve(a.id)} className="auth-button" style={{ width: 'auto', padding: '8px 16px' }}>
                                            Resolve
                                        </button>
                                    )}
                                    {a.isResolved && <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>Resolved</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LowStockAlerts;
