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

    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
    });

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
        setShowModal(true);
    };

    const handleStatusToggle = async (id) => {
        try {
            const response = await toggleUserStatus(id);
            toast.success(response.message);
            fetchStaff();
        } catch (error) {
            toast.error("Failed to update status");
        }
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;
        try {
            await deleteStaff(id);
            toast.success("Staff member deleted");
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`status-badge ${staff.isActive ? 'status-admin' : 'status-customer'}`} style={{ 
                                            background: staff.isActive ? '#dcfce7' : '#fee2e2',
                                            color: staff.isActive ? '#166534' : '#991b1b',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {staff.isActive ? 'Active' : 'Deactivated'}
                                        </span>
                                        <button 
                                            onClick={() => handleStatusToggle(staff.id)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontSize: '18px',
                                                color: staff.isActive ? '#ef4444' : '#22c55e',
                                                padding: '4px'
                                            }}
                                            title={staff.isActive ? "Deactivate User" : "Activate User"}
                                        >
                                            {staff.isActive ? '🔒' : '🔓'}
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button onClick={() => handleEditClick(staff)} style={{ background: 'transparent', color: 'var(--primary)', border: 'none', marginRight: '12px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                    <button onClick={() => handleDelete(staff.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
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
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
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
