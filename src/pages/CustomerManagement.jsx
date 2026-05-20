import React, { useEffect, useState } from 'react';
import { getCustomers, toggleUserStatus, addVehicle } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const CustomerManagement = () => {
    const [customerList, setCustomerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [vehicleLoading, setVehicleLoading] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: ''
    });
    
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

    const handleStatusToggle = async (id) => {
        try {
            const response = await toggleUserStatus(id);
            toast.success(response.message);
            fetchCustomers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddVehicleClick = (customerId) => {
        setSelectedCustomerId(customerId);
        setVehicleForm({ make: '', model: '', year: new Date().getFullYear(), licensePlate: '' });
        setShowVehicleModal(true);
    };

    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        setVehicleLoading(true);
        try {
            await addVehicle({ ...vehicleForm, customerId: selectedCustomerId });
            toast.success("Vehicle registered successfully");
            setShowVehicleModal(false);
        } catch (error) {
            toast.error(error.message || "Failed to register vehicle");
        } finally {
            setVehicleLoading(false);
        }
    };

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
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ 
                                            background: customer.isActive ? '#dcfce7' : '#fee2e2',
                                            color: customer.isActive ? '#166534' : '#991b1b',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            minWidth: '90px',
                                            textAlign: 'center'
                                        }}>
                                            {customer.isActive ? 'ACTIVE' : 'SUSPENDED'}
                                        </span>
                                        <button 
                                            onClick={() => handleStatusToggle(customer.id)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontSize: '18px',
                                                padding: '4px',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            title={customer.isActive ? "Deactivate Customer" : "Activate Customer"}
                                        >
                                            {customer.isActive ? '🔴' : '🟢'}
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button 
                                        className="auth-button" 
                                        style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                                        onClick={() => handleAddVehicleClick(customer.id)}
                                    >
                                        + Add Vehicle
                                    </button>
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

            {showVehicleModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '400px' }}>
                        <div className="auth-header">
                            <h2>Register Vehicle</h2>
                            <p className="subtitle">Add a vehicle to this customer's account</p>
                        </div>
                        <form onSubmit={handleVehicleSubmit}>
                            <div className="form-group">
                                <label>Make</label>
                                <input 
                                    value={vehicleForm.make} 
                                    onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})} 
                                    placeholder="e.g. Toyota" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Model</label>
                                <input 
                                    value={vehicleForm.model} 
                                    onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})} 
                                    placeholder="e.g. Corolla" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input 
                                    type="number"
                                    value={vehicleForm.year} 
                                    onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>License Plate</label>
                                <input 
                                    value={vehicleForm.licensePlate} 
                                    onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})} 
                                    placeholder="e.g. BA-PA-1234" 
                                    required 
                                />
                            </div>
                            <button type="submit" className="auth-button" disabled={vehicleLoading}>
                                {vehicleLoading ? 'Saving...' : 'Register Vehicle'}
                            </button>
                            <button type="button" className="auth-button" onClick={() => setShowVehicleModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginTop: '8px' }}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CustomerManagement;
