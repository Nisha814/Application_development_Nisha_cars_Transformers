import React, { useEffect, useState } from 'react';
import { getStockLogs, getInventoryItems } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const StockLogs = () => {
    const [logs, setLogs] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ partId: '', movementType: '' });

    const load = () => {
        setLoading(true);
        const params = {};
        if (filters.partId) params.partId = filters.partId;
        if (filters.movementType) params.movementType = filters.movementType;

        Promise.all([getStockLogs(params), getInventoryItems()])
            .then(([logsRes, itemsRes]) => {
                setLogs(logsRes.data || []);
                setItems(itemsRes.data || []);
            })
            .catch(() => toast.error('Failed to load stock logs'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Stock Logs</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Complete history of all stock movements</p>
                </div>
            </div>

            <div className="activity-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Part</label>
                        <select value={filters.partId} onChange={e => setFilters({ ...filters, partId: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', minWidth: 180 }}>
                            <option value="">All parts</option>
                            {items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Movement type</label>
                        <select value={filters.movementType} onChange={e => setFilters({ ...filters, movementType: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', minWidth: 150 }}>
                            <option value="">All types</option>
                            {['StockIn', 'StockOut', 'Sale', 'Damaged', 'Adjustment'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button onClick={load} className="auth-button" style={{ width: 'auto', padding: '10px 20px' }}>Apply Filters</button>
                </div>
            </div>

            <div className="activity-card">
                {loading ? <p>Loading...</p> : logs.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No stock logs found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ color: '#64748b', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0' }}>Date</th>
                                <th style={{ padding: '8px 0' }}>Part</th>
                                <th style={{ padding: '8px 0' }}>Type</th>
                                <th style={{ padding: '8px 0' }}>Qty</th>
                                <th style={{ padding: '8px 0' }}>Before → After</th>
                                <th style={{ padding: '8px 0' }}>Reference</th>
                                <th style={{ padding: '8px 0' }}>By</th>
                                <th style={{ padding: '8px 0' }}>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 0', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{log.partName}</td>
                                    <td style={{ padding: '10px 0' }}>{log.movementType}</td>
                                    <td style={{ padding: '10px 0' }}>{log.quantity}</td>
                                    <td style={{ padding: '10px 0' }}>{log.quantityBefore} → {log.quantityAfter}</td>
                                    <td style={{ padding: '10px 0' }}>{log.reference || '—'}</td>
                                    <td style={{ padding: '10px 0' }}>{log.performedBy}</td>
                                    <td style={{ padding: '10px 0', color: '#64748b' }}>{log.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StockLogs;
