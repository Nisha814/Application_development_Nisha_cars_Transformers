import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import api from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const tabs = ['Financial', 'Sales', 'Top Spenders', 'Pending Payments', 'Part Requests', 'Reviews'];

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('Financial');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const tableRef = useRef(null);

    const fetchTab = async (tab) => {
        // Clear cached tab data to allow refreshing after reminders/payments are made
        setLoading(true);
        try {
            const urlMap = {
                'Financial': '/reports/financial',
                'Sales': '/reports/sales',
                'Top Spenders': '/reports/top-spenders',
                'Pending Payments': '/reports/pending-payments',
                'Part Requests': '/reports/partrequests',
                'Reviews': '/reports/reviews',
            };
            const res = await api.get(urlMap[tab], { headers: headers() });
            setData(prev => ({ ...prev, [tab]: res.data }));
        } catch {
            toast.error(`Failed to load ${tab} report`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSearchQuery('');
        fetchTab(activeTab);
    }, [activeTab]);

    const handleSendReminder = async (creditId) => {
        toast.loading('Sending reminder email...');
        try {
            await api.post(`/Notification/remind/${creditId}`, {}, { headers: headers() });
            toast.dismiss();
            toast.success('Reminder email sent successfully!');
            // Refresh data
            setData({});
            fetchTab(activeTab);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Failed to send email reminder');
        }
    };

    const handleSendAllOverdueReminders = async () => {
        if (!window.confirm('Are you sure you want to send reminder emails to all overdue customers?')) return;
        toast.loading('Sending reminders...');
        try {
            await api.post('/Notification/remind-all-overdue', {}, { headers: headers() });
            toast.dismiss();
            toast.success('Overdue reminder emails sent successfully!');
            // Refresh data
            setData({});
            fetchTab(activeTab);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Failed to send email reminders');
        }
    };

    const exportPDF = async () => {
        if (!tableRef.current) return;
        toast.loading('Generating PDF...');
        try {
            const canvas = await html2canvas(tableRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const imgWidth = 280;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.setFontSize(16);
            pdf.text(`${activeTab} Report`, 10, 15);
            pdf.setFontSize(10);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 22);
            pdf.addImage(imgData, 'PNG', 10, 28, imgWidth, imgHeight);
            pdf.save(`${activeTab.replace(' ', '_')}_Report.pdf`);
            toast.dismiss();
            toast.success('PDF downloaded!');
        } catch {
            toast.dismiss();
            toast.error('PDF generation failed');
        }
    };

    const current = data[activeTab];

    const getFilteredData = () => {
        if (!current) return null;
        if (!searchQuery) return current;

        const query = searchQuery.toLowerCase();

        if (activeTab === 'Financial') {
            const filteredBreakdown = current.monthlyBreakdown?.filter(r => 
                r.month.toLowerCase().includes(query)
            ) || [];
            return { ...current, monthlyBreakdown: filteredBreakdown };
        }
        if (activeTab === 'Sales') {
            const filteredSales = current.topSellingParts?.filter(r => 
                r.partName.toLowerCase().includes(query)
            ) || [];
            return { ...current, topSellingParts: filteredSales };
        }
        if (activeTab === 'Top Spenders') {
            return current.filter(r => 
                r.fullName.toLowerCase().includes(query) || 
                r.email.toLowerCase().includes(query)
            );
        }
        if (activeTab === 'Pending Payments') {
            const filteredItems = current.items?.filter(r => 
                r.customerName.toLowerCase().includes(query) || 
                r.customerEmail.toLowerCase().includes(query) ||
                r.invoiceId.toString().includes(query)
            ) || [];
            return { ...current, items: filteredItems };
        }
        if (activeTab === 'Part Requests') {
            return current.filter(r => 
                r.customerName.toLowerCase().includes(query) || 
                r.customerEmail.toLowerCase().includes(query) ||
                r.partName.toLowerCase().includes(query) ||
                (r.vehicleMakeModel && r.vehicleMakeModel.toLowerCase().includes(query)) ||
                (r.description && r.description.toLowerCase().includes(query))
            );
        }
        if (activeTab === 'Reviews') {
            return current.filter(r => 
                r.customerName.toLowerCase().includes(query) || 
                r.customerEmail.toLowerCase().includes(query) ||
                (r.comment && r.comment.toLowerCase().includes(query))
            );
        }
        return current;
    };

    const filteredCurrent = getFilteredData();

    const renderTable = () => {
        if (loading) return <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</p>;
        if (!filteredCurrent) return null;

        if (activeTab === 'Financial') {
            return (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        {[
                            { label: 'Total Revenue', value: `$${Number(filteredCurrent.summary?.totalRevenue || 0).toFixed(2)}`, color: '#6366f1' },
                            { label: 'Total Paid', value: `$${Number(filteredCurrent.summary?.totalPaid || 0).toFixed(2)}`, color: '#22c55e' },
                            { label: 'Total Credit', value: `$${Number(filteredCurrent.summary?.totalCredit || 0).toFixed(2)}`, color: '#f59e0b' },
                            { label: 'Outstanding', value: `$${Number(filteredCurrent.summary?.totalOutstanding || 0).toFixed(2)}`, color: '#ef4444' },
                        ].map(s => (
                            <div key={s.label} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: '700', fontSize: '20px', color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <Table
                        headers={['Month', 'Revenue', 'Paid', 'Credit Sales', 'Invoice Count']}
                        rows={filteredCurrent.monthlyBreakdown?.map(r => [r.month, `$${Number(r.revenue).toFixed(2)}`, `$${Number(r.paidRevenue).toFixed(2)}`, `$${Number(r.creditRevenue).toFixed(2)}`, r.invoiceCount])}
                    />
                </div>
            );
        }
        if (activeTab === 'Sales') {
            return (
                <Table
                    headers={['Part Name', 'Units Sold', 'Total Revenue']}
                    rows={filteredCurrent.topSellingParts?.map(r => [r.partName, r.totalSold, `$${Number(r.totalRevenue).toFixed(2)}`])}
                />
            );
        }
        if (activeTab === 'Top Spenders') {
            return (
                <Table
                    headers={['#', 'Name', 'Email', 'Total Orders', 'Total Spent']}
                    rows={filteredCurrent?.map((r, i) => [i + 1, r.fullName, r.email, r.totalOrders, `$${Number(r.totalSpent).toFixed(2)}`])}
                />
            );
        }
        if (activeTab === 'Pending Payments') {
            return (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', textAlign: 'center', border: '1px solid #fca5a5' }}>
                            <div style={{ fontWeight: '700', fontSize: '20px', color: '#ef4444' }}>${Number(current.totalOutstanding || 0).toFixed(2)}</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>Total Outstanding</div>
                        </div>
                        <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '10px', textAlign: 'center', border: '1px solid #fcd34d' }}>
                            <div style={{ fontWeight: '700', fontSize: '20px', color: '#b45309' }}>{current.overdueCount}</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>Overdue Payments</div>
                        </div>
                    </div>
                    <Table
                        headers={['Customer', 'Email', 'Invoice #', 'Amount Due', 'Due Date', 'Status', 'Actions']}
                        rows={filteredCurrent.items?.map(r => [
                            r.customerName, 
                            r.customerEmail, 
                            `#${r.invoiceId}`,
                            `$${Number(r.amountDue).toFixed(2)}`,
                            new Date(r.dueDate).toLocaleDateString(),
                            r.isOverdue ? '🔴 Overdue' : '🟡 Pending',
                            <button onClick={() => handleSendReminder(r.id)} className="auth-button" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', background: 'var(--primary)' }}>
                                📧 Send Reminder
                            </button>
                        ])}
                    />
                </div>
            );
        }
        if (activeTab === 'Part Requests') {
            return (
                <Table
                    headers={['Customer', 'Email', 'Part Requested', 'Vehicle Info', 'Details/Notes', 'Status', 'Date']}
                    rows={filteredCurrent?.map(r => [
                        r.customerName,
                        r.customerEmail,
                        r.partName,
                        r.vehicleMakeModel,
                        r.description,
                        <span style={{ 
                            fontWeight: 'bold', 
                            color: r.status === 'Pending' ? '#b45309' : r.status === 'Ordered' ? '#1d4ed8' : r.status === 'Arrived' ? '#166534' : '#b91c1c' 
                        }}>{r.status}</span>,
                        new Date(r.createdAt).toLocaleDateString()
                    ])}
                />
            );
        }
        if (activeTab === 'Reviews') {
            return (
                <Table
                    headers={['Customer', 'Email', 'Rating', 'Comment', 'Date']}
                    rows={filteredCurrent?.map(r => [
                        r.customerName,
                        r.customerEmail,
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)} ({r.rating}/5)</span>,
                        r.comment,
                        new Date(r.createdAt).toLocaleDateString()
                    ])}
                />
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>📋 Reports</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Generate and export detailed business reports</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {activeTab === 'Pending Payments' && current?.overdueCount > 0 && (
                        <button className="auth-button" onClick={handleSendAllOverdueReminders} style={{ width: 'auto', padding: '10px 20px', background: '#ef4444' }}>
                            📢 Remind All Overdue
                        </button>
                    )}
                    <button className="auth-button" onClick={exportPDF} style={{ width: 'auto', padding: '10px 20px' }}>
                        ⬇️ Export PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        background: 'none', border: 'none', padding: '12px 20px', cursor: 'pointer',
                        fontWeight: activeTab === tab ? '700' : '500',
                        color: activeTab === tab ? 'var(--primary)' : '#64748b',
                        borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                        marginBottom: '-2px', fontSize: '14px', transition: 'all 0.2s'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Search Filter */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                <input
                    type="text"
                    placeholder={`Search in ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        width: '320px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
            </div>

            <div ref={tableRef} className="activity-card">
                {renderTable()}
            </div>
        </DashboardLayout>
    );
};

const Table = ({ headers, rows }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                {headers.map(h => <th key={h} style={{ padding: '12px 16px', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
            </tr>
        </thead>
        <tbody>
            {rows?.length === 0 && (
                <tr><td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No data available.</td></tr>
            )}
            {rows?.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                    {row.map((cell, j) => <td key={j} style={{ padding: '12px 16px' }}>{cell}</td>)}
                </tr>
            ))}
        </tbody>
    </table>
);

export default ReportsPage;
