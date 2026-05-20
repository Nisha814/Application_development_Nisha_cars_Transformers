import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import api from '../services/api';

const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899'];

const AnalyticsDashboard = () => {
    const [financial, setFinancial] = useState(null);
    const [sales, setSales] = useState(null);
    const [customers, setCustomers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/reports/financial', { headers: headers() }),
            api.get('/reports/sales', { headers: headers() }),
            api.get('/reports/customers', { headers: headers() }),
        ]).then(([fin, sal, cust]) => {
            setFinancial(fin.data);
            setSales(sal.data);
            setCustomers(cust.data);
            setLoading(false);
        }).catch(() => {
            toast.error("Failed to load analytics data");
            setLoading(false);
        });
    }, []);

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Analytics...</h2></div></DashboardLayout>;

    const topPartsData = sales?.topSellingParts
        ?.map(p => ({
            fullName: p.partName,
            name: p.partName.length > 12 ? p.partName.slice(0, 12) + '…' : p.partName,
            units: p.totalSold,
            revenue: Number(p.totalRevenue)
        }))
        ?.filter(p => 
            p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        ?.slice(0, 6) || [];

    const monthlyData = financial?.monthlyBreakdown
        ?.filter(m => 
            !searchQuery || 
            m.month.toLowerCase().includes(searchQuery.toLowerCase())
        )
        ?.map(m => ({
            month: m.month.slice(5),
            Revenue: Number(m.revenue),
            Paid: Number(m.paidRevenue),
            Credit: Number(m.creditRevenue),
        })) || [];

    const customerGrowthData = customers?.monthlyGrowth
        ?.filter(m => 
            !searchQuery || 
            m.month.toLowerCase().includes(searchQuery.toLowerCase())
        )
        ?.map(m => ({
            month: m.month.slice(5),
            'New Customers': m.newCustomers
        })) || [];

    const pieData = [
        { name: 'Paid Sales', value: Number(financial?.summary?.totalPaid || 0) },
        { name: 'Credit Sales', value: Number(financial?.summary?.totalCredit || 0) },
        { name: 'Outstanding', value: Number(financial?.summary?.totalOutstanding || 0) },
    ].filter(d => d.value > 0);

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>📊 Analytics Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Business performance overview</p>
                </div>
            </div>

            {/* Search Filter */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                <input
                    type="text"
                    placeholder="Search and filter top selling parts..."
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

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Revenue', value: `$${Number(financial?.summary?.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: '#6366f1' },
                    { label: 'Outstanding', value: `$${Number(financial?.summary?.totalOutstanding || 0).toFixed(2)}`, icon: '⚠️', color: '#ef4444' },
                    { label: 'Total Invoices', value: sales?.totalInvoices ?? 0, icon: '🧾', color: '#22c55e' },
                    { label: 'Total Customers', value: customers?.totalCustomers ?? 0, icon: '👥', color: '#f59e0b' },
                ].map(card => (
                    <div key={card.label} className="activity-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px' }}>{card.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: card.color, margin: '4px 0' }}>{card.value}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="activity-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Monthly Revenue Breakdown</h3>
                {monthlyData.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No sales data yet. Create some invoices to see charts!</p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Paid" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Credit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Top Selling Parts */}
                <div className="activity-card">
                    <h3 style={{ marginBottom: '20px' }}>Top Selling Parts</h3>
                    {topPartsData.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No parts sold yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={topPartsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="units" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {topPartsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Revenue Pie */}
                <div className="activity-card">
                    <h3 style={{ marginBottom: '20px' }}>Revenue Distribution</h3>
                    {pieData.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Customer Growth */}
            <div className="activity-card">
                <h3 style={{ marginBottom: '20px' }}>Customer Growth</h3>
                {customerGrowthData.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No customer data yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={customerGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="New Customers" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyticsDashboard;
