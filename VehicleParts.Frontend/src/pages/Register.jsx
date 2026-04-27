import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, verifyOtp } from '../services/api';
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

    if (step === 2) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Verify Email</h2>
                        <p className="subtitle">Enter the 6-digit code sent to {formData.email}</p>
                    </div>
                    <form onSubmit={handleOtpSubmit}>
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                placeholder="123456"
                                maxLength="6"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        Didn't get the code? <span onClick={() => setStep(1)} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>Try again</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p className="subtitle">Join our inventory management system today</p>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" placeholder="John Doe" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} required />
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

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
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
                            <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Your password must contain:</p>
                            <div style={{ display: 'grid', gap: '6px' }}>
                                <CheckItem label="Minimum number of characters is 6" active={checks.length} />
                                <CheckItem label="Should contain lowercase" active={checks.lower} />
                                <CheckItem label="Should contain uppercase" active={checks.upper} />
                                <CheckItem label="Should contain numbers" active={checks.number} />
                                <CheckItem label="Should contain special characters" active={checks.special} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

const CheckItem = ({ label, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: active ? '#22c55e' : '#94a3b8' }}>
        <span style={{ fontSize: '14px' }}>{active ? '✓' : '✕'}</span>
        <span>{label}</span>
    </div>
);

export default Register;
