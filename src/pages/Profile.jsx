import React, { useState, useEffect, useRef } from 'react';
import { updateProfile, uploadMedia } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const API_BASE_URL = 'http://localhost:5026';
const PhoneInputComponent = PhoneInput.default || PhoneInput;

const Profile = () => {
    const [user, setUser] = useState({
        fullName: localStorage.getItem('fullName') || '',
        email: localStorage.getItem('email') || '',
        role: localStorage.getItem('role') || '',
        phoneNumber: localStorage.getItem('phoneNumber') || '',
        profilePictureUrl: localStorage.getItem('profilePictureUrl') || null
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePhoneChange = (value) => {
        setUser({ ...user, phoneNumber: '+' + value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading("Uploading image...");
        try {
            const response = await uploadMedia(file, 'profiles');
            const imageUrl = response.data.url;
            
            const profileResponse = await updateProfile({
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                profilePictureUrl: imageUrl
            });

            setUser(prev => ({ ...prev, profilePictureUrl: imageUrl }));
            localStorage.setItem('profilePictureUrl', imageUrl);
            toast.success("Profile picture updated!", { id: loadingToast });
        } catch (error) {
            toast.error("Upload failed: " + (error.message || "Unknown error"), { id: loadingToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Nepal Phone Validation
        if (user.phoneNumber.startsWith('+977')) {
            const digitsOnly = user.phoneNumber.replace('+977', '');
            if (digitsOnly.length !== 10) {
                toast.error("Nepal phone numbers must be exactly 10 digits long!");
                return;
            }
        }

        setLoading(true);
        try {
            const response = await updateProfile({
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                profilePictureUrl: user.profilePictureUrl
            });
            
            localStorage.setItem('fullName', response.data.fullName);
            localStorage.setItem('phoneNumber', response.data.phoneNumber || '');
            
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="management-header">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>My Profile</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>View and update your personal information</p>
                </div>
            </div>

            <div className="activity-card" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ position: 'relative' }}>
                        {user.profilePictureUrl ? (
                            <img 
                                src={`${API_BASE_URL}${user.profilePictureUrl}`} 
                                alt="Profile" 
                                style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            />
                        ) : (
                            <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '40px', borderRadius: '20px' }}>
                                {user.fullName[0]}
                            </div>
                        )}
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', padding: '0', fontSize: '14px' }}
                        >
                            📸
                        </button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '22px', fontWeight: '700' }}>{user.fullName}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user.role} Account</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={user.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address (Read-only)</label>
                        <input type="email" value={user.email} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <PhoneInputComponent
                            country={'np'}
                            value={user.phoneNumber}
                            onChange={handlePhoneChange}
                            containerStyle={{ width: '100%' }}
                            inputStyle={{ width: '100%', height: '45px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                            buttonStyle={{ borderRadius: '12px 0 0 12px', background: 'white', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>User Role (Read-only)</label>
                        <input type="text" value={user.role} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                    </div>
                    <button type="submit" className="auth-button" style={{ marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile Information'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
