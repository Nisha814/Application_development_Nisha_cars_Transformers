import React, { useEffect, useState } from 'react';
import { getStaff, addStaff, updateStaff, deleteStaff, toggleUserStatus } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneInputComponent = PhoneInput.default || PhoneInput;

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 1 
    });

    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        const pass = formData.password || '';
        const newChecks = {
            length: pass.length >= 6,
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        };
        setChecks(newChecks);
        const activeChecks = Object.values(newChecks).filter(Boolean).length;
        setStrength(activeChecks);
    }, [formData.password]);

    const getStrengthLevel = () => {
        if (strength === 0) return 'Empty';
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    };

    const fetchStaff = async () => {
        try {
            const response = await getStaff();
            setStaffList(response.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load staff data");
            setLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff => 
        staff.role === 'Staff' && (
            (staff.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phoneNumber: '+' + value });
    };

    const handleAddClick = () => {
        setFormData({ fullName: '', email: '', phoneNumber: '', password: '', role: 1 });
        setIsEditing(false);
        setShowPassword(false);
        setShowModal(true);
    };

    const handleEditClick = (staff) => {
        setFormData({
            fullName: staff.fullName,
            email: staff.email,
            phoneNumber: staff.phoneNumber || '',
            password: '', 
            role: 1
        });
        setCurrentId(staff.id);
        setIsEditing(true);
        setShowPassword(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phoneNumber.startsWith('+977')) {
            const digitsOnly = formData.phoneNumber.replace('+977', '');
            if (digitsOnly.length !== 10) {
                toast.error("Nepal phone numbers must be exactly 10 digits long!");
                return;
            }
        }

        if (!isEditing && strength < 3) {
            toast.error("Please provide a stronger password for staff");
            return;
        }

        setFormLoading(true);
        try {
            if (isEditing) {
                await updateStaff(currentId, formData);
                toast.success("Staff updated successfully");
            } else {
                await addStaff(formData);
                toast.success("Staff member added successfully");
            }
            setShowModal(false);
            fetchStaff();
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
            await deleteStaff(deleteId);
            toast.success("Staff member deleted successfully!");
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchStaff();
        } catch (error) {
            toast.error("Failed to delete staff member");
        }
    };

    if (loading) return <DashboardLayout><div style={{ padding: '40px' }}><h2>Loading Staff...</h2></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Staff Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage system administrators and staff members</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search staff..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 16px', paddingLeft: '40px', borderRadius: '10px', width: '250px' }}
                        />
                        <span style={{ position: 'absolute', left: '15px', top: '10px', color: 'var(--text-muted)' }}>🔍</span>
                    </div>
                    <button className="auth-button" onClick={handleAddClick} style={{ width: 'auto', padding: '10px 20px' }}>
                        + Add New Staff
                    </button>
                </div>
            </div>

            <div className="activity-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Full Name</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(staff => (
                            <tr key={staff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>{staff.fullName}</td>
                                <td style={{ padding: '16px' }}>{staff.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <span className={`status-badge ${staff.isActive ? 'status-admin' : 'status-customer'}`} style={{ 
                                        background: staff.isActive ? '#dcfce7' : '#fee2e2',
                                        color: staff.isActive ? '#166534' : '#991b1b',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'inline-block'
                                    }}>
                                        {staff.isActive ? '🟢 Active' : '🔴 Offline'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button onClick={() => handleEditClick(staff)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', marginRight: '12px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                    <button onClick={() => handleDeleteClick(staff.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
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
                            <h2>{isEditing ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                            <p className="subtitle">Enter staff details below</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required />
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
                                <label>Role (Read-only)</label>
                                <input value="Staff" disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                            </div>
                            {!isEditing && (
                                <>
                                    <div className="form-group" style={{ marginBottom: '10px' }}>
                                        <label>Password</label>
                                        <div className="cyber-input-wrapper" style={{ position: 'relative' }}>
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                name="password" 
                                                value={formData.password} 
                                                onChange={handleInputChange} 
                                                required 
                                                style={{ paddingRight: '48px' }}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-eye"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-muted)'
                                                }}
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="password-meter" style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div 
                                                    key={i} 
                                                    style={{ 
                                                        height: '6px', 
                                                        flex: 1, 
                                                        borderRadius: '10px', 
                                                        background: i <= strength ? (strength <= 2 ? '#ef4444' : strength <= 4 ? '#3b82f6' : '#22c55e') : '#e2e8f0',
                                                        transition: 'all 0.3s ease'
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>Level: <strong>{getStrengthLevel()}</strong></p>
                                        <div className="password-checklist" style={{ fontSize: '13px', color: '#64748b' }}>
                                            <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Staff password must contain:</p>
                                            <div style={{ display: 'grid', gap: '6px' }}>
                                                <CheckItem label="Minimum number of characters is 6" active={checks.length} />
                                                <CheckItem label="Should contain lowercase" active={checks.lower} />
                                                <CheckItem label="Should contain uppercase" active={checks.upper} />
                                                <CheckItem label="Should contain numbers" active={checks.number} />
                                                <CheckItem label="Should contain special characters" active={checks.special} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="auth-button" disabled={formLoading}>
                                {formLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Staff')}
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
                            Are you sure you want to delete this staff member? This action cannot be undone.
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

const CheckItem = ({ label, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: active ? '#22c55e' : '#94a3b8' }}>
        <span style={{ fontSize: '14px' }}>{active ? '✓' : '✕'}</span>
        <span>{label}</span>
    </div>
);

export default StaffManagement;
