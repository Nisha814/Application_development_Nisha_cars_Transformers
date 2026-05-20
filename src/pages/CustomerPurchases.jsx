import React, { useEffect, useState } from 'react';
import { getMyPurchases } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyPurchases()
            .then(res => setPurchases(res.data || []))
            .catch(() => toast.error('Failed to load purchase history'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Purchase History</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>All your parts purchases and invoices</p>
                </div>
            </div>
            <div className="activity-card">
                {loading ? <p>Loading...</p> : purchases.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No purchases yet.</p>
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
                            {purchases.map(s => (
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
        </DashboardLayout>
    );
};

export default CustomerPurchases;
