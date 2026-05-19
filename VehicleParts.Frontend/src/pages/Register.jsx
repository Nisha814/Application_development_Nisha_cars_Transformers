import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, verifyOtp, resendOtp } from '../services/api';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Fix for some environments where PhoneInput is imported as an object
const PhoneInputComponent = PhoneInput.default || PhoneInput;

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '', // This will store the full number with code
        password: '',
        role: 2 
    });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); 
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Password validation state
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const pass = formData.password;
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phoneNumber: '+' + value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        // Nepal Phone Validation
        if (formData.phoneNumber.startsWith('+977')) {
            const digitsOnly = formData.phoneNumber.replace('+977', '');
            if (digitsOnly.length !== 10) {
                toast.error("Nepal phone numbers must be exactly 10 digits long!");
                return;
            }
        } else if (formData.phoneNumber.length < 8) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (strength < 3) {
            toast.error("Password is too weak!");
            return;
        }
        setLoading(true);
        try {
            const response = await register(formData);
            toast.success(response.message || "OTP sent to your email!");
            setStep(2);
        } catch (error) {
            toast.error(error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await verifyOtp(formData.email, otpCode);
            toast.success(response.message || "Account verified successfully!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const response = await resendOtp(formData.email);
            toast.success(response.message || "A new OTP code has been sent!");
        } catch (error) {
            toast.error(error.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="cyber-login-wrapper" style={{ overflowY: 'auto', padding: '20px 0' }}>
                <style>{`
                    .cyber-login-wrapper h1,
                    .cyber-login-wrapper h2,
                    .cyber-login-wrapper h3,
                    .cyber-login-wrapper h4,
                    .cyber-login-wrapper .telemetry-value {
                        color: #ffffff !important;
                    }
                    .cyber-login-wrapper p {
                        color: #94a3b8 !important;
                    }
                    .cyber-login-wrapper label,
                    .cyber-login-wrapper .telemetry-label,
                    .cyber-login-wrapper .subtitle {
                        color: #a5b4fc !important;
                    }
                    .cyber-login-wrapper .react-tel-input .form-control {
                        background: rgba(6, 9, 19, 0.6) !important;
                        color: #ffffff !important;
                        border: 1px solid rgba(99, 102, 241, 0.25) !important;
                    }
                    .cyber-login-wrapper .react-tel-input .flag-dropdown {
                        background: rgba(6, 9, 19, 0.8) !important;
                        border: 1px solid rgba(99, 102, 241, 0.25) !important;
                    }
                    .cyber-login-wrapper .react-tel-input .country-list {
                        background: #0f172a !important;
                        color: #ffffff !important;
                    }
                `}</style>
                <div className="cyber-split-container">
                    
                    {/* Left Panel: Animated Vehicle & System Telemetry */}
                    <div className="cyber-panel-left">
                        <h1 style={{ color: '#ffffff' }}>
                            Vehicle Parts<br />
                            <span style={{ background: 'linear-gradient(90deg, #00f2fe, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.3))' }}>Management Portal</span>
                        </h1>
                        <p style={{ color: '#94a3b8' }}>
                            Secure, high-speed system access initialization. Track parts inventory, manage authorized staff members, and supervise vendor accounts in real-time.
                        </p>
                        
                        {/* Live Telemetry Data Cards */}
                        <div className="telemetry-dashboard">
                            <div className="telemetry-card">
                                <div className="telemetry-label" style={{ color: '#a5b4fc' }}>System Gateway</div>
                                <div className="telemetry-value" style={{ color: '#ffffff' }}>Online</div>
                                <div className="telemetry-status">
                                    <span className="telemetry-indicator-dot"></span>
                                    JWT SECURED
                                </div>
                            </div>
                            
                            <div className="telemetry-card">
                                <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Data Integrity</div>
                                <div className="telemetry-value" style={{ color: '#ffffff' }}>Active</div>
                                <div className="telemetry-status" style={{ color: '#00f2fe' }}>
                                    <span className="telemetry-indicator-dot" style={{ background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }}></span>
                                    BCRYPT ENCRYPTED
                                </div>
                            </div>
                            
                            <div className="telemetry-card">
                                <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Server Database</div>
                                <div className="telemetry-value" style={{ color: '#ffffff' }}>PostgreSQL</div>
                                <div className="telemetry-status" style={{ color: '#38bdf8' }}>
                                    <span className="telemetry-indicator-dot" style={{ background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }}></span>
                                    100% HEALTHY
                                </div>
                            </div>
                            
                            <div className="telemetry-card">
                                <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Network Latency</div>
                                <div className="telemetry-value" style={{ color: '#ffffff' }}>12 ms</div>
                                <div className="telemetry-status" style={{ color: '#10b981' }}>
                                    <span className="telemetry-indicator-dot"></span>
                                    OPTIMAL
                                </div>
                            </div>
                        </div>
                        
                        {/* Spinning Component Gear Animation */}
                        <div className="gear-telemetry">
                            <svg className="spinning-gear" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.44 12.99l1.56-1.2-1.2-2.08-1.92.48c-.36-.36-.84-.72-1.32-.96l-.36-1.92h-2.4l-.36 1.92c-.48.24-.96.6-1.32.96l-1.92-.48-1.2 2.08 1.56 1.2c0 .24-.12.48-.12.72s.06.48.12.72l-1.56 1.2 1.2 2.08 1.92-.48c.36.36.84.72 1.32.96l.36 1.92h2.4l.36-1.92c.48-.24.96-.6 1.32-.96l1.92.48 1.2-2.08-1.56-1.2c.06-.24.12-.48.12-.72s-.06-.48-.12-.72z" fill="#00f2fe" opacity="0.3"/>
                                <circle cx="12" cy="12" r="3" fill="#00f2fe"/>
                            </svg>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#a5b4fc', letterSpacing: '0.1em' }}>
                                DIAGNOSTICS: CORE SYSTEMS FULLY FUNCTIONAL
                            </span>
                        </div>
                    </div>
                    
                    {/* Right Panel: Cyber Verify Form Card */}
                    <div className="cyber-panel-right">
                        <div className="cyber-card">
                            <div className="cyber-card-header">
                                <span className="cyber-system-tag" style={{ color: '#00f2fe' }}>AUTH_CORE_v2.0_SECURE</span>
                                <div className="cyber-logo-icon">
                                    {/* 3D Glowing Automotive Gear / Transformer Shield Logo */}
                                    <svg className="cyber-shield-logo" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L3 7v6c0 5.52 4.48 10 9 10s9-4.48 9-10V7l-9-5z" fill="url(#logo-grad-1)" opacity="0.15" />
                                        <path d="M12 22c4.03 0 7.5-3.3 8-8H4c.5 4.7 3.97 8 8 8z" fill="url(#logo-grad-2)" opacity="0.2" />
                                        <circle cx="12" cy="12" r="6" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" className="rotating-outer-ring" />
                                        <polygon points="12,8 15,13 9,13" fill="#6366f1" className="inner-shield-triangle" />
                                        <circle cx="12" cy="13" r="1.5" fill="#00f2fe" />
                                        
                                        <defs>
                                            <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#00f2fe" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                            <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#f43f5e" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <h2 style={{ color: '#ffffff' }}>Verify Email</h2>
                                <p className="subtitle" style={{ color: '#a5b4fc' }}>Enter the 6-digit code sent to {formData.email}</p>
                            </div>
                            <form onSubmit={handleOtpSubmit}>
                                <div className="cyber-form-group">
                                    <label style={{ color: '#a5b4fc' }}>OTP Code</label>
                                    <input
                                        type="text"
                                        className="cyber-input"
                                        placeholder="123456"
                                        maxLength="6"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', color: '#ffffff' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="cyber-button" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                            </form>
                            <div className="cyber-footer" style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '13px' }}>
                                <span onClick={handleResendOtp} style={{ color: '#00f2fe', cursor: 'pointer', fontWeight: '600' }}>Resend Code</span>
                                <span style={{ color: '#94a3b8' }}>|</span>
                                <span onClick={() => setStep(1)} style={{ color: '#a5b4fc', cursor: 'pointer', fontWeight: '600' }}>Edit Details</span>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        );
    }

    return (
        <div className="cyber-login-wrapper" style={{ overflowY: 'auto', padding: '40px 0' }}>
            <style>{`
                .cyber-login-wrapper h1,
                .cyber-login-wrapper h2,
                .cyber-login-wrapper h3,
                .cyber-login-wrapper h4,
                .cyber-login-wrapper .telemetry-value {
                    color: #ffffff !important;
                }
                .cyber-login-wrapper p {
                    color: #94a3b8 !important;
                }
                .cyber-login-wrapper label,
                .cyber-login-wrapper .telemetry-label,
                .cyber-login-wrapper .subtitle {
                    color: #a5b4fc !important;
                }
                .cyber-login-wrapper .react-tel-input .form-control {
                    background: rgba(6, 9, 19, 0.6) !important;
                    color: #ffffff !important;
                    border: 1px solid rgba(99, 102, 241, 0.25) !important;
                }
                .cyber-login-wrapper .react-tel-input .flag-dropdown {
                    background: rgba(6, 9, 19, 0.8) !important;
                    border: 1px solid rgba(99, 102, 241, 0.25) !important;
                }
                .cyber-login-wrapper .react-tel-input .country-list {
                    background: #0f172a !important;
                    color: #ffffff !important;
                }
            `}</style>
            <div className="cyber-glass-frame">
                <div className="cyber-split-container">
                
                {/* Left Panel: Animated Vehicle & System Telemetry */}
                <div className="cyber-panel-left">
                    <h1 style={{ color: '#ffffff' }}>
                        Vehicle Parts<br />
                        <span style={{ background: 'linear-gradient(90deg, #00f2fe, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.3))' }}>Management Portal</span>
                    </h1>
                    <p style={{ color: '#94a3b8' }}>
                        Secure, high-speed system access initialization. Track parts inventory, manage authorized staff members, and supervise vendor accounts in real-time.
                    </p>
                    
                    {/* Live Telemetry Data Cards */}
                    <div className="telemetry-dashboard">
                        <div className="telemetry-card">
                            <div className="telemetry-label" style={{ color: '#a5b4fc' }}>System Gateway</div>
                            <div className="telemetry-value" style={{ color: '#ffffff' }}>Online</div>
                            <div className="telemetry-status">
                                <span className="telemetry-indicator-dot"></span>
                                JWT SECURED
                            </div>
                        </div>
                        
                        <div className="telemetry-card">
                            <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Data Integrity</div>
                            <div className="telemetry-value" style={{ color: '#ffffff' }}>Active</div>
                            <div className="telemetry-status" style={{ color: '#00f2fe' }}>
                                <span className="telemetry-indicator-dot" style={{ background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }}></span>
                                BCRYPT ENCRYPTED
                            </div>
                        </div>
                        
                        <div className="telemetry-card">
                            <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Server Database</div>
                            <div className="telemetry-value" style={{ color: '#ffffff' }}>PostgreSQL</div>
                            <div className="telemetry-status" style={{ color: '#38bdf8' }}>
                                <span className="telemetry-indicator-dot" style={{ background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }}></span>
                                100% HEALTHY
                            </div>
                        </div>
                        
                        <div className="telemetry-card">
                            <div className="telemetry-label" style={{ color: '#a5b4fc' }}>Network Latency</div>
                            <div className="telemetry-value" style={{ color: '#ffffff' }}>12 ms</div>
                            <div className="telemetry-status" style={{ color: '#10b981' }}>
                                <span className="telemetry-indicator-dot"></span>
                                OPTIMAL
                            </div>
                        </div>
                    </div>
                    
                    {/* Spinning Component Gear Animation */}
                    <div className="gear-telemetry">
                        <svg className="spinning-gear" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.44 12.99l1.56-1.2-1.2-2.08-1.92.48c-.36-.36-.84-.72-1.32-.96l-.36-1.92h-2.4l-.36 1.92c-.48.24-.96.6-1.32.96l-1.92-.48-1.2 2.08 1.56 1.2c0 .24-.12.48-.12.72s.06.48.12.72l-1.56 1.2 1.2 2.08 1.92-.48c.36.36.84.72 1.32.96l.36 1.92h2.4l.36-1.92c.48-.24.96-.6 1.32-.96l1.92.48 1.2-2.08-1.56-1.2c.06-.24.12-.48.12-.72s-.06-.48-.12-.72z" fill="#00f2fe" opacity="0.3"/>
                            <circle cx="12" cy="12" r="3" fill="#00f2fe"/>
                        </svg>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#a5b4fc', letterSpacing: '0.1em' }}>
                            DIAGNOSTICS: CORE SYSTEMS FULLY FUNCTIONAL
                        </span>
                    </div>
                </div>
                
                {/* Right Panel: Cyber Signup Form Card */}
                <div className="cyber-panel-right">
                    <div className="cyber-card" style={{ padding: '36px' }}>
                        
                        <div className="cyber-card-header" style={{ marginBottom: '24px' }}>
                            <span className="cyber-system-tag" style={{ color: '#00f2fe' }}>AUTH_CORE_v2.0_SECURE</span>
                            <div className="cyber-logo-icon" style={{ marginBottom: '12px' }}>
                                {/* 3D Glowing Automotive Gear / Transformer Shield Logo */}
                                <svg className="cyber-shield-logo" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L3 7v6c0 5.52 4.48 10 9 10s9-4.48 9-10V7l-9-5z" fill="url(#logo-grad-1)" opacity="0.15" />
                                    <path d="M12 22c4.03 0 7.5-3.3 8-8H4c.5 4.7 3.97 8 8 8z" fill="url(#logo-grad-2)" opacity="0.2" />
                                    <circle cx="12" cy="12" r="6" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" className="rotating-outer-ring" />
                                    <polygon points="12,8 15,13 9,13" fill="#6366f1" className="inner-shield-triangle" />
                                    <circle cx="12" cy="13" r="1.5" fill="#00f2fe" />
                                    
                                    <defs>
                                        <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00f2fe" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                        <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f43f5e" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 style={{ color: '#ffffff' }}>Create Account</h2>
                            <p className="subtitle" style={{ color: '#a5b4fc' }}>Register customer credentials</p>
                        </div>
                        
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="cyber-form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ color: '#a5b4fc' }}>Full Name</label>
                                <div className="cyber-input-wrapper">
                                    <span className="cyber-input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        className="cyber-input"
                                        placeholder="Himal Khadka" 
                                        onChange={handleChange} 
                                        style={{ color: '#ffffff' }}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="cyber-form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ color: '#a5b4fc' }}>Email Address</label>
                                <div className="cyber-input-wrapper">
                                    <span className="cyber-input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </span>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="cyber-input"
                                        placeholder="himal@gmail.com" 
                                        onChange={handleChange} 
                                        style={{ color: '#ffffff' }}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="cyber-form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ color: '#a5b4fc' }}>Phone Number</label>
                                <div className="cyber-input-wrapper">
                                    <PhoneInputComponent
                                        country={'np'}
                                        value={formData.phoneNumber}
                                        onChange={handlePhoneChange}
                                        containerStyle={{ width: '100%', position: 'relative' }}
                                        inputStyle={{ 
                                            width: '100%', 
                                            height: '48px', 
                                            borderRadius: '10px', 
                                            border: '1px solid rgba(99, 102, 241, 0.2)', 
                                            background: 'rgba(15, 23, 42, 0.6)', 
                                            color: '#ffffff',
                                            paddingLeft: '48px',
                                            fontSize: '15px'
                                        }}
                                        buttonStyle={{ 
                                            borderRadius: '10px 0 0 10px', 
                                            background: 'rgba(15, 23, 42, 0.8)', 
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            borderRight: 'none'
                                        }}
                                        dropdownStyle={{
                                            background: '#0f172a',
                                            color: '#ffffff',
                                            border: '1px solid rgba(99, 102, 241, 0.3)'
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div className="cyber-form-group" style={{ marginBottom: '10px' }}>
                                <label style={{ color: '#a5b4fc' }}>Password</label>
                                <div className="cyber-input-wrapper">
                                    <span className="cyber-input-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        className="cyber-input"
                                        placeholder="••••••••••••" 
                                        onChange={handleChange} 
                                        style={{ color: '#ffffff', paddingRight: '48px' }}
                                        required 
                                    />
                                    <span 
                                        className="password-toggle-eye" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer', position: 'absolute', right: '16px', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="password-meter" style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div 
                                            key={i} 
                                            style={{ 
                                                height: '4px', 
                                                flex: 1, 
                                                borderRadius: '10px', 
                                                background: i <= strength ? (strength <= 2 ? '#ef4444' : strength <= 4 ? '#00f2fe' : '#10b981') : 'rgba(99, 102, 241, 0.1)',
                                                transition: 'all 0.3s ease'
                                            }} 
                                        />
                                    ))}
                                </div>
                                <p style={{ fontSize: '13px', margin: '0 0 12px 0', fontFamily: 'monospace', color: '#94a3b8' }}>
                                    Level: <strong style={{ color: strength <= 2 ? '#ef4444' : strength <= 4 ? '#00f2fe' : '#10b981' }}>{getStrengthLevel()}</strong>
                                </p>
                                
                                <div className="password-checklist" style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    <p style={{ fontWeight: '600', color: '#ffffff', marginBottom: '6px', fontFamily: 'monospace' }}>REQUIRED SPECIFICATIONS:</p>
                                    <div style={{ display: 'grid', gap: '6px' }}>
                                        <CheckItem label="Minimum 6 characters" active={checks.length} />
                                        <CheckItem label="Contain lowercase letters" active={checks.lower} />
                                        <CheckItem label="Contain uppercase letters" active={checks.upper} />
                                        <CheckItem label="Contain numerical digits" active={checks.number} />
                                        <CheckItem label="Contain special characters" active={checks.special} />
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="cyber-button" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Sign Up'}
                            </button>
                        </form>
                        
                        <div className="cyber-footer">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </div>
                
            </div>
            {/* Home footer navigation */}
            <div className="home-navigation-footer">
                <Link to="/" className="back-to-home-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>
            </div>
        </div>
    </div>
    );
};

const CheckItem = ({ label, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: active ? '#10b981' : '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
        <span style={{ fontSize: '14px', color: active ? '#10b981' : '#ef4444' }}>{active ? '✓' : '✕'}</span>
        <span>{label}</span>
    </div>
);

export default Register;
