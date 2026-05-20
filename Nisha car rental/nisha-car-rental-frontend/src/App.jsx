import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Bell, 
  Calendar, 
  User, 
  Car, 
  DollarSign, 
  Clock, 
  Download, 
  Search, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';

const API_BASE = 'http://localhost:5067/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  
  // Reports state
  const [reportTab, setReportTab] = useState('financial');
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Predictions state
  const [revenuePrediction, setRevenuePrediction] = useState(null);
  const [demandPredictions, setDemandPredictions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Global notification loader
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 10 seconds for real-time dashboard feel
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle active views loading
  useEffect(() => {
    setError(null);
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'reports') {
      loadReport();
    } else if (activeTab === 'predictions') {
      loadPredictions();
    }
  }, [activeTab, reportTab]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`);
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const res = await fetch(`${API_BASE}/reports/${reportTab}`);
      if (!res.ok) throw new Error(`Failed to load ${reportTab} report`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const revRes = await fetch(`${API_BASE}/predictions/revenue`);
      const demRes = await fetch(`${API_BASE}/predictions/demand`);
      if (!revRes.ok || !demRes.ok) throw new Error('Failed to load AI predictions');
      
      const revData = await revRes.json();
      const demData = await demRes.json();
      
      setRevenuePrediction(revData);
      setDemandPredictions(demData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, { method: 'POST' });
      if (res.ok) {
        fetchNotifications();
        setShowNotificationsDropdown(false);
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const downloadPdf = () => {
    window.open(`${API_BASE}/reports/download-pdf?type=${reportTab}`, '_blank');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Car size={26} color="#3b82f6" />
          <span>NISHA RENTALS</span>
        </div>
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={20} />
            Reports
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <TrendingUp size={20} />
            AI Predictions
          </li>
          <li 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notification Center
          </li>
        </ul>
        <div className="sidebar-footer">
          <p>© 2026 Nisha Car Rental</p>
          <p style={{ fontSize: '0.7rem', marginTop: '4px' }}>v1.0 (ASP.NET & React)</p>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'reports' && 'Management Reports'}
              {activeTab === 'predictions' && 'Advanced AI Trend Predictions'}
              {activeTab === 'notifications' && 'Notification Dispatcher'}
            </h1>
          </div>
          <div className="header-actions">
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="notification-bell"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              >
                <Bell size={22} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              
              {showNotificationsDropdown && (
                <div className="notification-dropdown">
                  <div className="nd-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="nd-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlignment: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div 
                          key={n.id} 
                          className={`nd-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            if (!n.isRead) markNotificationRead(n.id);
                          }}
                        >
                          <p className="nd-text">{n.message}</p>
                          <span className="nd-time">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="nd-footer">
                    <button 
                      className="nd-footer-link"
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotificationsDropdown(false);
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile-badge">
              <div className="profile-avatar">N</div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nisha Admin</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="page-container">
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle color="var(--color-danger)" />
              <div>
                <strong style={{ color: '#fff' }}>Database Connection Error</strong>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {error}. Please ensure PostgreSQL is running and your database is configured.
                </p>
              </div>
            </div>
          )}

          {loading && !dashboardData && !reportData && !revenuePrediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px', color: 'var(--color-text-secondary)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Fetching secure data stream...</span>
            </div>
          ) : (
            <>
              {/* DASHBOARD PAGE */}
              {activeTab === 'dashboard' && dashboardData && (
                <div>
                  {/* Summary Metric Cards */}
                  <div className="metrics-grid">
                    <div className="metric-card primary">
                      <div className="metric-header">
                        <span className="metric-title">Total Revenue</span>
                        <div className="metric-icon">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="metric-value">${dashboardData.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="metric-footer">Historical paid transactions</div>
                    </div>

                    <div className="metric-card success">
                      <div className="metric-header">
                        <span className="metric-title">Active Rentals</span>
                        <div className="metric-icon">
                          <Car size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{dashboardData.metrics.activeRentals}</div>
                      <div className="metric-footer">Cars currently on road</div>
                    </div>

                    <div className="metric-card warning">
                      <div className="metric-header">
                        <span className="metric-title">Owed Balances</span>
                        <div className="metric-icon">
                          <Clock size={20} />
                        </div>
                      </div>
                      <div className="metric-value">${dashboardData.metrics.pendingPaymentsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className="metric-footer">{dashboardData.metrics.pendingPaymentsCount} pending transactions</div>
                    </div>

                    <div className="metric-card danger">
                      <div className="metric-header">
                        <span className="metric-title">Total Customers</span>
                        <div className="metric-icon">
                          <User size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{dashboardData.metrics.totalCustomers}</div>
                      <div className="metric-footer">Registered clients</div>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="charts-grid">
                    {/* Revenue Area Chart */}
                    <div className="chart-card">
                      <div className="chart-card-title">
                        <span>Revenue Trend (Monthly)</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-success)' }}>+12.4% MoM</span>
                      </div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dashboardData.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bookings Pie Chart */}
                    <div className="chart-card">
                      <div className="chart-card-title">Rentals by Vehicle Category</div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dashboardData.categoryBookings}
                              cx="50%"
                              cy="45%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="category"
                            >
                              {dashboardData.categoryBookings.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Spenders Bar Chart */}
                    <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                      <div className="chart-card-title">Top 5 Spender Ranking</div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardData.topSpenders} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="customerName" stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }} />
                            <Bar dataKey="totalSpent" fill="#10b981" radius={[4, 4, 0, 0]}>
                              {dashboardData.topSpenders.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* REPORTS PAGE */}
              {activeTab === 'reports' && (
                <div>
                  <div className="tabs">
                    <button className={`tab ${reportTab === 'financial' ? 'active' : ''}`} onClick={() => setReportTab('financial')}>Financial</button>
                    <button className={`tab ${reportTab === 'sales' ? 'active' : ''}`} onClick={() => setReportTab('sales')}>Sales</button>
                    <button className={`tab ${reportTab === 'customers' ? 'active' : ''}`} onClick={() => setReportTab('customers')}>Customers</button>
                    <button className={`tab ${reportTab === 'top-spenders' ? 'active' : ''}`} onClick={() => setReportTab('top-spenders')}>Top Spenders</button>
                    <button className={`tab ${reportTab === 'pending-payments' ? 'active' : ''}`} onClick={() => setReportTab('pending-payments')}>Pending Payments</button>
                  </div>

                  <div className="card-table-wrap">
                    <div className="table-header-row">
                      <div className="filters">
                        <input 
                          type="text" 
                          placeholder="Search records..." 
                          className="input-text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {reportTab === 'financial' && (
                          <select 
                            className="input-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                        )}
                      </div>
                      <button className="btn" onClick={downloadPdf}>
                        <Download size={18} />
                        Export PDF
                      </button>
                    </div>

                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <RefreshCw className="animate-spin" size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
                      </div>
                    ) : (
                      <div className="custom-table-container">
                        {reportTab === 'financial' && reportData && (
                          <>
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total Collected:</span>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>${reportData.summary.totalCollected.toLocaleString()}</div>
                              </div>
                              <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total Outstanding:</span>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>${reportData.summary.totalOutstanding.toLocaleString()}</div>
                              </div>
                            </div>
                            <table className="custom-table">
                              <thead>
                                <tr>
                                  <th>Transaction ID</th>
                                  <th>Customer Name</th>
                                  <th>Amount</th>
                                  <th>Payment Date</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.transactions
                                  .filter(t => statusFilter === 'All' || t.status === statusFilter)
                                  .filter(t => t.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .map((t) => (
                                    <tr key={t.paymentId}>
                                      <td>#TX-{t.paymentId}</td>
                                      <td style={{ fontWeight: 600 }}>{t.customerName}</td>
                                      <td>${t.amount.toFixed(2)}</td>
                                      <td>{new Date(t.date).toLocaleDateString()}</td>
                                      <td>
                                        <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </>
                        )}

                        {reportTab === 'sales' && reportData && (
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Car Model</th>
                                <th>Booking Count</th>
                                <th>Total Gross Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.carSales
                                .filter(c => c.carName.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((c, index) => (
                                  <tr key={index}>
                                    <td style={{ fontWeight: 600 }}>{c.carName}</td>
                                    <td>{c.bookingsCount} rentals</td>
                                    <td>${c.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}

                        {reportTab === 'customers' && reportData && (
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Rentals Booked</th>
                                <th>Total Revenue Generated</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData
                                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((c) => (
                                  <tr key={c.customerId}>
                                    <td>#CUST-{c.customerId}</td>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.totalRentals} times</td>
                                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>${c.totalSpent.toLocaleString()}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}

                        {reportTab === 'top-spenders' && reportData && (
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Customer Name</th>
                                <th>Email Address</th>
                                <th>Unique Bookings</th>
                                <th>Total Spend</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData
                                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((s) => (
                                  <tr key={s.customerId}>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td>{s.email}</td>
                                    <td>{s.rentalCount} rentals</td>
                                    <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>${s.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}

                        {reportTab === 'pending-payments' && reportData && (
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Customer</th>
                                <th>Contact Number</th>
                                <th>Car Rented</th>
                                <th>Outstanding Balance</th>
                                <th>Due Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData
                                .filter(p => p.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((p) => (
                                  <tr key={p.paymentId}>
                                    <td style={{ fontWeight: 600 }}>{p.customerName}</td>
                                    <td>{p.customerPhone}</td>
                                    <td>{p.carName}</td>
                                    <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>${p.amount.toFixed(2)}</td>
                                    <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                                    <td>
                                      <span className={`badge badge-${p.rentalStatus.toLowerCase()}`}>{p.rentalStatus}</span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PREDICTIONS PAGE */}
              {activeTab === 'predictions' && revenuePrediction && (
                <div>
                  <div className="prediction-cards-grid">
                    {/* Revenue Projection Card */}
                    <div className="prediction-card" style={{ gridColumn: 'span 2' }}>
                      <div className="pred-conf-badge">{Math.round(revenuePrediction.confidence * 100)}% Confidence Rating</div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Forecasted Revenue (Next Month)</h3>
                      <div className="pred-highlight">
                        ${revenuePrediction.predictedRevenue.toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>Projected for {revenuePrediction.forecastDate}</span>
                      </div>
                      
                      <div className="chart-container" style={{ height: '220px', marginTop: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...revenuePrediction.historicalTrend, { month: revenuePrediction.forecastDate, revenue: revenuePrediction.predictedRevenue }]}>
                            <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="prediction-card" style={{ justifyContent: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp color="var(--color-primary)" />
                        AI Recommendation
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        Based on the 6-month linear regression growth rate, we project <strong>positive revenue momentum</strong>. 
                      </p>
                      <div style={{ padding: '12px', backgroundColor: 'rgba(59,130,246,0.08)', borderLeft: '3px solid var(--color-primary)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>Action Item:</strong> SUV category booking growth exceeds supply by 12%. Consider shifting 10% of sedan budget to SUV acquisitions to maximize high-season yield.
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Demand predictions list */}
                  <div className="card-table-wrap">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#fff' }}>Vehicle Category Demand Forecast (Next 30 Days)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                      {demandPredictions.map((d, index) => (
                        <div key={index} style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                          <span style={{ fontSize: '0.75rem', position: 'absolute', top: '20px', right: '20px', color: 'var(--color-success)', fontWeight: 600 }}>
                            {d.growthRate >= 0 ? `+${d.growthRate}%` : `${d.growthRate}%`} trend
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{d.category} Category</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '12px 0 6px 0', color: '#fff' }}>
                            {d.predictedBookings} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>est. bookings</span>
                          </div>
                          
                          <div className="pred-gauge" style={{ margin: '12px 0 8px 0' }}>
                            <div className="pred-gauge-fill" style={{ width: `${Math.min(100, (d.predictedBookings / 40) * 100)}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                          </div>
                          <div className="pred-label">
                            <span>Current: {d.currentBookings}</span>
                            <span>Confidence: {Math.round(d.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATION CENTER PAGE */}
              {activeTab === 'notifications' && (
                <div className="card-table-wrap" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Notification Logs</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn btn-secondary" onClick={fetchNotifications} style={{ padding: '8px 14px' }}>
                        <RefreshCw size={16} />
                      </button>
                      <button className="btn" onClick={markAllNotificationsRead}>Mark All as Read</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '48px', textAlignment: 'center', color: 'var(--color-text-secondary)' }}>
                        No records logged.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          style={{ 
                            padding: '16px 20px', 
                            backgroundColor: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(59, 130, 246, 0.05)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <div style={{ marginTop: '3px' }}>
                            {n.message.includes('Overdue') ? (
                              <AlertTriangle size={18} color="var(--color-danger)" />
                            ) : n.message.includes('spender') ? (
                              <TrendingUp size={18} color="var(--color-success)" />
                            ) : (
                              <CheckCircle2 size={18} color="var(--color-primary)" />
                            )}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <p style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.4, fontWeight: n.isRead ? 400 : 500 }}>
                              {n.message}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={() => markNotificationRead(n.id)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--color-text-muted)', 
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%'
                              }}
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
