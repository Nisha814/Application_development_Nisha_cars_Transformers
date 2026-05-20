import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventoryDashboard } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const InventoryDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInventoryDashboard()
            .then(res => setData(res.data))
            .catch(() => toast.error('Failed to load inventory dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <DashboardLayout><p style={{ padding: 40 }}>Loading...</p></DashboardLayout>;

    const stats = [
        { icon: '📦', label: 'Total SKUs', value: data?.totalItems ?? 0, color: 'var(--primary)' },
        { icon: '🔢', label: 'Total Units', value: data?.totalUnits ?? 0, color: '#6366f1' },
        { icon: '💰', label: 'Inventory Value', value: `$${(data?.totalValuation ?? 0).toFixed(2)}`, color: '#22c55e' },
        { icon: '⚠️', label: 'Low Stock', value: data?.lowStockCount ?? 0, color: '#f59e0b', path: '/inventory/alerts' },
        { icon: '🚫', label: 'Out of Stock', value: data?.outOfStockCount ?? 0, color: '#ef4444', path: '/inventory/alerts' },
        { icon: '🔔', label: 'Active Alerts', value: data?.activeAlerts ?? 0, color: '#ec4899', path: '/inventory/alerts' },
    ];

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Inventory Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Stock overview and analytics</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 24 }}>
                {stats.map(s => (
                    <div key={s.label} className="activity-card" style={{ textAlign: 'center', cursor: s.path ? 'pointer' : 'default' }}
                        onClick={() => s.path && navigate(s.path)}>
                        <div style={{ fontSize: 28 }}>{s.icon}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 24 }}>
                {[
                    { icon: '📥', label: 'Stock In/Out', path: '/inventory/tracking' },
                    { icon: '📋', label: 'Stock Logs', path: '/inventory/logs' },
                    { icon: '⚠️', label: 'Low Stock Alerts', path: '/inventory/alerts' },
                    { icon: '💰', label: 'Valuation', path: '/inventory/tracking' },
                ].map(item => (
                    <div key={item.path} className="activity-card" style={{ cursor: 'pointer', textAlign: 'center', padding: 20 }}
                        onClick={() => navigate(item.path)}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            <div className="activity-card">
                <h3 style={{ marginBottom: 15, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>Recent Stock Movements</h3>
                {!data?.recentLogs?.length ? (
                    <p style={{ color: '#94a3b8' }}>No stock movements yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ color: '#64748b', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0' }}>Part</th>
                                <th style={{ padding: '8px 0' }}>Type</th>
                                <th style={{ padding: '8px 0' }}>Qty</th>
                                <th style={{ padding: '8px 0' }}>Before → After</th>
                                <th style={{ padding: '8px 0' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentLogs.map(log => (
                                <tr key={log.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{log.partName}</td>
                                    <td style={{ padding: '10px 0' }}><TypeBadge type={log.movementType} /></td>
                                    <td style={{ padding: '10px 0' }}>{log.quantity}</td>
                                    <td style={{ padding: '10px 0' }}>{log.quantityBefore} → {log.quantityAfter}</td>
                                    <td style={{ padding: '10px 0', color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

const TypeBadge = ({ type }) => {
    const colors = { StockIn: '#dcfce7', StockOut: '#fee2e2', Sale: '#dbeafe', Damaged: '#fef3c7', Adjustment: '#f3e8ff' };
    const fg = { StockIn: '#166534', StockOut: '#b91c1c', Sale: '#1d4ed8', Damaged: '#b45309', Adjustment: '#7c3aed' };
    return (
        <span style={{ padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 'bold', background: colors[type] || '#f1f5f9', color: fg[type] || '#64748b' }}>
            {type}
        </span>
    );
};

export default InventoryDashboard;
