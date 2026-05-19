import React, { useEffect, useState } from 'react';
import { getCustomers, toggleUserStatus } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerManagement = () => {
    const [customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await getCustomers();
            setCustomerList(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load customer data");
            setLoading(false);
        }
    };

    const filteredCustomers = customerList.filter(customer => 
        (customer.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Customers...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Customer Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>View and manage your registered customers</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px 16px', paddingLeft: '40px', borderRadius: '10px', width: '300px' }}
                    />
                    <span style={{ position: 'absolute', left: '15px', top: '10px', color: 'var(--text-muted)' }}>🔍</span>
                </div>
            </div>

            <div className="activity-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Customer Name</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Verified</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                            <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>{customer.fullName}</td>
                                <td style={{ padding: '16px' }}>{customer.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        color: customer.isVerified ? '#22c55e' : '#f59e0b',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    }}>
                                        {customer.isVerified ? '✅ Verified' : '⏳ Pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        background: customer.isActive ? '#dcfce7' : '#fee2e2',
                                        color: customer.isActive ? '#166534' : '#991b1b',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'inline-block'
                                    }}>
                                        {customer.isActive ? '🟢 Active' : '🔴 Offline'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default CustomerManagement;
