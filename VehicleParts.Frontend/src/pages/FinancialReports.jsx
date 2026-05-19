import React, { useEffect, useState } from 'react';
import { getFinancialReports } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const FinancialReports = () => {
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [period]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await getFinancialReports(period);
            setReport(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load financial analytical reports");
            setLoading(false);
        }
    };

    if (loading && !report) {
        return (
            <DashboardLayout>
                <div style={{ padding: '40px' }}>
                    <h2>Generating Analytical Financial Reports...</h2>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="management-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Financial Reports & Analytics</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analyze your procurement costs, inventory values, and supplier statistics</p>
                </div>
                
                {/* Period Selector Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
                    {['daily', 'monthly', 'yearly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                border: 'none',
                                background: period === p ? 'white' : 'transparent',
                                color: period === p ? '#1e293b' : '#64748b',
                                padding: '8px 18px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                textTransform: 'capitalize',
                                boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {p} Reports
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: '500' }}>Total Supplier Expenditures</p>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        Rs. {report?.totalSpending.toLocaleString()}
                    </h3>
                </div>

                <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧾</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: '500' }}>Invoiced Orders</p>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        {report?.invoicesCount} Invoices
                    </h3>
                </div>

                <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: '500' }}>Inventory Asset Value</p>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        Rs. {report?.inventoryValuation.toLocaleString()}
                    </h3>
                </div>

                <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0', fontWeight: '500' }}>Active Partners / Vendors</p>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        {report?.activeSuppliersCount} Suppliers
                    </h3>
                </div>
            </div>

            {/* Split layout for Table and Category breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* Time-Series Expenditures Table */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                            Expenditures History Breakdown ({period})
                        </h3>
                    </div>
                    
                    <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '13px' }}>
                                    <th style={{ padding: '14px 20px' }}>Period Frame</th>
                                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Transactions</th>
                                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Total Expenses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report?.timeSeries.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                                            No financial data recorded for this period frame.
                                        </td>
                                    </tr>
                                ) : (
                                    report?.timeSeries.slice().reverse().map((entry, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: entry.amount > 0 ? '#fafafb' : 'white' }}>
                                            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#334155' }}>
                                                {entry.label}
                                            </td>
                                            <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700', color: entry.transactionsCount > 0 ? 'var(--primary)' : '#94a3b8' }}>
                                                {entry.transactionsCount}
                                            </td>
                                            <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '700', color: entry.amount > 0 ? '#1e293b' : '#94a3b8' }}>
                                                Rs. {entry.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock valuation category share */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>
                        Inventory Valuation Share
                    </h3>

                    {report?.categoryBreakdown.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>No stock items found. Add parts in inventory to generate share breakdown!</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '18px' }}>
                            {report?.categoryBreakdown.map((cat, idx) => {
                                // Assign distinct curated color palettes based on category index
                                const colors = [
                                    '#2563eb', // blue
                                    '#10b981', // green
                                    '#8b5cf6', // purple
                                    '#f59e0b', // amber
                                    '#ec4899', // pink
                                    '#06b6d4', // cyan
                                ];
                                const color = colors[idx % colors.length];

                                return (
                                    <div key={cat.categoryName}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: '600', color: '#475569' }}>
                                                🛠️ {cat.categoryName} ({cat.partsCount} parts)
                                            </span>
                                            <span style={{ fontWeight: '700', color: '#1e293b' }}>
                                                Rs. {cat.totalValuation.toLocaleString()} ({cat.percentage}%)
                                            </span>
                                        </div>
                                        
                                        {/* Progress share bar */}
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div 
                                                style={{ 
                                                    height: '100%', 
                                                    width: `${cat.percentage}%`, 
                                                    background: color, 
                                                    borderRadius: '10px',
                                                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
};

export default FinancialReports;
