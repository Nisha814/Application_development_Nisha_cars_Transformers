import React, { useEffect, useState } from 'react';
import { getVendors, addVendor, updateVendor, deleteVendor } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInputComponent = PhoneInput.default || PhoneInput;

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        vendorName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        address: ''
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await getVendors();
            setVendors(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load vendor data");
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(vendor => 
        (vendor.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phoneNumber: '+' + value });
    };

    const handleAddClick = () => {
        setFormData({ vendorName: '', contactPerson: '', email: '', phoneNumber: '', address: '' });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (vendor) => {
        setFormData({
            vendorName: vendor.vendorName,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phoneNumber: vendor.phoneNumber || '',
            address: vendor.address || ''
        });
        setCurrentId(vendor.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Nepal Phone Validation
        if (formData.phoneNumber.startsWith('+977')) {
            const digitsOnly = formData.phoneNumber.replace('+977', '');
            if (digitsOnly.length !== 10) {
                toast.error("Nepal phone numbers must be exactly 10 digits long!");
                return;
            }
        }

        setFormLoading(true);
        try {
            if (isEditing) {
                await updateVendor(currentId, formData);
                toast.success("Vendor updated successfully");
            } else {
                await addVendor(formData);
                toast.success("Vendor registered successfully");
            }
            setShowModal(false);
            fetchVendors();
        } catch (error) {
            toast.error(error.message || "Operation failed");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteVendor(deleteId);
            toast.success("Vendor deleted successfully!");
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchVendors();
        } catch (error) {
            toast.error("Failed to delete vendor");
        }
    };

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Vendors...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Vendor Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>View and manage your registered vendors</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search vendors..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 16px', paddingLeft: '40px', borderRadius: '10px', width: '250px' }}
                        />
                        <span style={{ position: 'absolute', left: '15px', top: '10px', color: 'var(--text-muted)' }}>🔍</span>
                    </div>
                    <button className="auth-button" onClick={handleAddClick} style={{ width: 'auto', padding: '10px 20px' }}>
                        + Add New Vendor
                    </button>
                </div>
            </div>

            <div className="activity-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Vendor Name</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Contact Person</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map(vendor => (
                            <tr key={vendor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>{vendor.vendorName}</td>
                                <td style={{ padding: '16px' }}>{vendor.contactPerson}</td>
                                <td style={{ padding: '16px' }}>{vendor.email}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button onClick={() => handleEditClick(vendor)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', marginRight: '12px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                    <button onClick={() => handleDeleteClick(vendor.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <div className="auth-header">
                            <h2>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                            <p className="subtitle">Enter vendor details below</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Vendor Name</label>
                                <input name="vendorName" value={formData.vendorName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <PhoneInputComponent
                                    country={'np'}
                                    value={formData.phoneNumber}
                                    onChange={handlePhoneChange}
                                    containerStyle={{ width: '100%' }}
                                    inputStyle={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    buttonStyle={{ borderRadius: '12px 0 0 12px', background: 'white', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input name="address" value={formData.address} onChange={handleInputChange} required />
                            </div>
                            <button type="submit" className="auth-button" disabled={formLoading}>
                                {formLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Register Vendor')}
                            </button>
                            <button type="button" className="auth-button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', marginTop: '8px' }}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="auth-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '50px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Confirm Deletion</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            Are you sure you want to delete this vendor? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }} 
                                className="auth-button" 
                                style={{ 
                                    background: '#e2e8f0', 
                                    color: '#475569', 
                                    width: 'auto', 
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDelete} 
                                className="auth-button" 
                                style={{ 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    width: 'auto', 
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorManagement;
