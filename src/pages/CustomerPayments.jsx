import React, { useEffect, useState } from 'react';
import { getPendingPayments, payMyCredit } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerPayments = () => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        getPendingPayments()
            .then(res => setCredits(res.data || []))
            .catch(() => toast.error('Failed to load pending payments'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handlePay = async (creditId) => {
        if (!window.confirm('Record payment for this invoice?')) return;
        try {
            await payMyCredit(creditId);
            toast.success('Payment recorded');
            load();
        } catch (err) {
            toast.error(err.message || 'Payment failed');
        }
    };

    const totalDue = credits.reduce((sum, c) => sum + c.amountDue, 0);

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Pending Payments</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track and pay outstanding balances</p>
                </div>
            </div>

            <div className="activity-card" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px' }}>💳</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: totalDue > 0 ? '#ef4444' : '#22c55e' }}>
                    ${totalDue.toFixed(2)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Outstanding</div>
            </div>

            <div className="activity-card">
                {loading ? <p>Loading...</p> : credits.length === 0 ? (
                    <p style={{ color: '#94a3b8' }}>No pending payments. You're all caught up!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {credits.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                <div>
                                    <strong>Invoice #{c.salesInvoiceId}</strong>
                                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>
                                        Due: {new Date(c.dueDate).toLocaleDateString()}
                                        {c.invoiceDate && ` • Purchased: ${new Date(c.invoiceDate).toLocaleDateString()}`}
                                    </p>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>${c.amountDue.toFixed(2)}</span>
                                </div>
                                <button onClick={() => handlePay(c.id)} className="auth-button" style={{ width: 'auto', padding: '8px 20px' }}>
                                    Pay Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerPayments;
