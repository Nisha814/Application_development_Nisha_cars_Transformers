import React, { useState } from 'react';
import { searchCustomers, getCustomerHistory, payCredit } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const res = await searchCustomers(searchTerm);
            setCustomers(res.data);
            setHistoryData(null); // Clear previous history when searching
            if (res.data.length === 0) toast.error("No customers found");
        } catch (error) {
            toast.error("Failed to search customers");
        } finally {
            setLoading(false);
        }
    };

    const loadCustomerHistory = async (id) => {
        setLoading(true);
        try {
            const res = await getCustomerHistory(id);
            setHistoryData(res.data);
            setCustomers([]); // Clear search list, focus on this customer
        } catch (error) {
            toast.error("Failed to load customer history");
        } finally {
            setLoading(false);
        }
    };

    const handlePayCredit = async (creditId) => {
        if (!window.confirm("Are you sure you want to mark this credit as paid?")) return;
        try {
            await payCredit(creditId);
            toast.success("Credit marked as paid");
            // Reload history to reflect changes
            if (historyData?.customer?.id) {
                loadCustomerHistory(historyData.customer.id);
            }
        } catch (error) {
            toast.error(error.message || "Failed to process payment");
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Customer History</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Search and view customer purchases, vehicles, and credit</p>
                </div>
            </div>

            <div className="activity-card" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Search customer by name, email, or phone number..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                    />
                    <button type="submit" className="auth-button" style={{ width: 'auto', padding: '10px 24px' }} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {customers.length > 0 && !historyData && (
                    <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                        <h4 style={{ color: '#64748b' }}>Search Results:</h4>
                        {customers.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '16px' }}>{c.fullName}</strong>
                                    <span style={{ color: '#64748b' }}>{c.email} • {c.phoneNumber}</span>
                                </div>
                                <button onClick={() => loadCustomerHistory(c.id)} className="auth-button" style={{ width: 'auto', padding: '8px 16px', background: 'var(--primary)' }}>
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {historyData && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Customer Profile Header */}
                    <div className="activity-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>{historyData.customer.fullName}</h3>
                            <p style={{ margin: 0, color: '#64748b' }}>{historyData.customer.email} | {historyData.customer.phoneNumber}</p>
                        </div>
                        <button onClick={() => setHistoryData(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
                            Clear Profile
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        {/* Left Column: Vehicles & Credits */}
                        <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
                            <div className="activity-card">
                                <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', margin: '0 0 15px 0' }}>Registered Vehicles ({historyData.vehicles.length})</h4>
                                {historyData.vehicles.length === 0 ? (
                                    <p style={{ color: '#94a3b8' }}>No vehicles registered.</p>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {historyData.vehicles.map(v => (
                                            <li key={v.id} style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
                                                <strong>{v.make} {v.model}</strong> ({v.year})<br/>
                                                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Plate: {v.licensePlate}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="activity-card">
                                <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', margin: '0 0 15px 0' }}>Outstanding Credits</h4>
                                {historyData.credits.filter(c => !c.isPaid).length === 0 ? (
                                    <p style={{ color: '#16a34a' }}>No outstanding credits! 🎉</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {historyData.credits.filter(c => !c.isPaid).map(c => (
                                            <div key={c.id} style={{ padding: '10px', border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <strong style={{ color: '#991b1b' }}>Due: ${c.amountDue.toFixed(2)}</strong>
                                                    <span style={{ fontSize: '12px', color: '#991b1b' }}>Invoice #{c.salesInvoiceId}</span>
                                                </div>
                                                <p style={{ fontSize: '12px', margin: '0 0 10px 0', color: '#7f1d1d' }}>
                                                    Due Date: {new Date(c.dueDate).toLocaleDateString()}
                                                </p>
                                                <button 
                                                    onClick={() => handlePayCredit(c.id)}
                                                    className="auth-button" 
                                                    style={{ background: '#22c55e', padding: '6px', fontSize: '12px' }}
                                                >
                                                    Mark as Paid
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Invoice History */}
                        <div className="activity-card">
                            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', margin: '0 0 15px 0' }}>Purchase History ({historyData.sales.length})</h4>
                            {historyData.sales.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>No past purchases found.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textAlign: 'left' }}>
                                            <th style={{ padding: '10px' }}>Inv #</th>
                                            <th style={{ padding: '10px' }}>Date</th>
                                            <th style={{ padding: '10px' }}>Total Amount</th>
                                            <th style={{ padding: '10px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.sales.map(s => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{s.id}</td>
                                                <td style={{ padding: '12px' }}>{new Date(s.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '12px', fontWeight: 'bold' }}>${s.totalAmount.toFixed(2)}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        background: s.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7',
                                                        color: s.paymentStatus === 'Paid' ? '#166534' : '#b45309'
                                                    }}>
                                                        {s.paymentStatus.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CustomerHistory;
