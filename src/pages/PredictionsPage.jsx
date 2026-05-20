import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import api from '../services/api';

const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const PredictionsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports/predictions', { headers: headers() })
            .then(res => { setData(res.data); setLoading(false); })
            .catch(() => { toast.error("Failed to load predictions"); setLoading(false); });
    }, []);

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Analysing trends...</h2></div></DashboardLayout>;

    const cards = data ? [
        {
            title: 'Revenue Forecast',
            icon: '💰',
            trend: data.revenue?.trend,
            change: data.revenue?.changePercent,
            thisMonth: `$${Number(data.revenue?.thisMonth || 0).toFixed(2)}`,
            lastMonth: `$${Number(data.revenue?.lastMonth || 0).toFixed(2)}`,
            projection: `$${Number(data.revenue?.projectedNextMonth || 0).toFixed(2)}`,
            projectionLabel: 'Projected Next Month',
            color: data.revenue?.trend === 'up' ? '#22c55e' : '#ef4444',
            bg: data.revenue?.trend === 'up' ? '#f0fdf4' : '#fef2f2',
        },
        {
            title: 'Orders Forecast',
            icon: '🧾',
            trend: data.orders?.trend,
            change: data.orders?.changePercent,
            thisMonth: `${data.orders?.thisMonth} orders`,
            lastMonth: `${data.orders?.lastMonth} orders`,
            projection: null,
            color: data.orders?.trend === 'up' ? '#22c55e' : '#ef4444',
            bg: data.orders?.trend === 'up' ? '#f0fdf4' : '#fef2f2',
        },
        {
            title: 'Customer Growth',
            icon: '👥',
            trend: data.customerGrowth?.trend,
            change: data.customerGrowth?.changePercent,
            thisMonth: `${data.customerGrowth?.thisMonth} new customers`,
            lastMonth: `${data.customerGrowth?.lastMonth} new customers`,
            projection: null,
            color: data.customerGrowth?.trend === 'up' ? '#22c55e' : '#ef4444',
            bg: data.customerGrowth?.trend === 'up' ? '#f0fdf4' : '#fef2f2',
        },
    ] : [];

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>🤖 Predictions & Trends</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Smart trend analysis based on your business data</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {cards.map(card => (
                    <div key={card.title} className="activity-card" style={{ background: card.bg, border: `1px solid ${card.color}30` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{card.title}</h3>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '28px', fontWeight: '700', color: card.color,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    {card.trend === 'up' ? '↑' : '↓'}
                                    {Math.abs(card.change)}%
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>vs last month</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>This Month</div>
                                <div style={{ fontWeight: '700', fontSize: '16px' }}>{card.thisMonth}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Last Month</div>
                                <div style={{ fontWeight: '700', fontSize: '16px' }}>{card.lastMonth}</div>
                            </div>
                        </div>

                        {card.projection && (
                            <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', borderLeft: `4px solid ${card.color}` }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>📈 {card.projectionLabel}</div>
                                <div style={{ fontWeight: '700', fontSize: '22px', color: card.color }}>{card.projection}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                    Based on {card.change >= 0 ? '+' : ''}{card.change}% month-over-month trend
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="activity-card" style={{ marginTop: '20px', background: '#f8fafc' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>ℹ️ How Predictions Work</h4>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                    Predictions are calculated by comparing this month's data to last month's data. 
                    Revenue projections use the current month-over-month growth rate to estimate next month's performance.
                    These are trend-based estimates — actual results may vary.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default PredictionsPage;
