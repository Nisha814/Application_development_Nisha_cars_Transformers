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
        fullName: sessionStorage.getItem('fullName') || '',
        email: sessionStorage.getItem('email') || '',
        role: sessionStorage.getItem('role') || '',
        phoneNumber: sessionStorage.getItem('phoneNumber') || '',
        profilePictureUrl: sessionStorage.getItem('profilePictureUrl') || null,
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const pass = user.password || '';
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
    }, [user.password]);

    const getStrengthLevel = () => {
        if (strength === 0) return 'Empty';
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    };

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
            sessionStorage.setItem('profilePictureUrl', imageUrl);
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

        // Password validation if entered
        if (user.password && strength < 5) {
            toast.error("New password must meet all security requirements!");
            return;
        }

        setLoading(true);
        try {
            const response = await updateProfile({
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                profilePictureUrl: user.profilePictureUrl,
                password: user.password || null
            });
            
            sessionStorage.setItem('fullName', response.data.fullName);
            sessionStorage.setItem('phoneNumber', response.data.phoneNumber || '');
            
            setUser(prev => ({ ...prev, password: '' }));
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
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label>Change Password (Leave blank to keep current)</label>
                        <div className="cyber-input-wrapper" style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={user.password} 
                                onChange={handleChange} 
                                style={{ paddingRight: '48px' }}
                                placeholder="Enter new password"
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

                    {user.password && (
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
                                <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Password must contain:</p>
                                <div style={{ display: 'grid', gap: '6px' }}>
                                    <CheckItem label="Minimum number of characters is 6" active={checks.length} />
                                    <CheckItem label="Should contain lowercase" active={checks.lower} />
                                    <CheckItem label="Should contain uppercase" active={checks.upper} />
                                    <CheckItem label="Should contain numbers" active={checks.number} />
                                    <CheckItem label="Should contain special characters" active={checks.special} />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-button" style={{ marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile Information'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default Profile;

const CheckItem = ({ label, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: active ? '#22c55e' : '#94a3b8' }}>
        <span style={{ fontSize: '14px' }}>{active ? '✓' : '✕'}</span>
        <span>{label}</span>
    </div>
);
