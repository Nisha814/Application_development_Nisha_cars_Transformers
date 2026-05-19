import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(email, password);
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('role', response.data.role);
            sessionStorage.setItem('fullName', response.data.fullName);
            sessionStorage.setItem('email', response.data.email);
            sessionStorage.setItem('profilePictureUrl', response.data.profilePictureUrl || '');
            
            toast.success(response.message || "Login successful!");
            
            setTimeout(() => {
                const role = response.data.role;
                if (role === 'Admin') navigate('/admin-dashboard');
                else if (role === 'Staff') navigate('/staff-dashboard');
                else navigate('/customer-dashboard');
            }, 1000);
        } catch (error) {
            toast.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cyber-login-wrapper">
            <style>{`
                .cyber-login-wrapper h1,
                .cyber-login-wrapper h2,
                .cyber-login-wrapper h3,
                .cyber-login-wrapper h4,
                .cyber-login-wrapper .telemetry-value,
                .cyber-login-wrapper .readout-value {
                    color: #ffffff !important;
                }
                .cyber-login-wrapper p {
                    color: #94a3b8 !important;
                }
                .cyber-login-wrapper label,
                .cyber-login-wrapper .telemetry-label,
                .cyber-login-wrapper .readout-label,
                .cyber-login-wrapper .subtitle {
                    color: #a5b4fc !important;
                }
            `}</style>
            <div className="cyber-glass-frame">
                <div className="cyber-split-container">
                    
                    {/* Left Panel: Slogan & Futuristic Car Telemetry */}
                    <div className="cyber-panel-left">
                        <div className="hero-text-block">
                            <h1 style={{ color: '#ffffff' }}>
                                GEAR UP FOR<br />
                                <span style={{ background: 'linear-gradient(90deg, #00f2fe, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.3))' }}>ULTIMATE CONTROL</span>
                            </h1>
                            <p style={{ color: '#94a3b8' }}>
                                Join VehicleParts and experience high-speed parts distribution, real-time stock diagnostics, and a fully secured system dashboard.
                            </p>
                        </div>
                        
                        {/* Custom Vehicle Diagnostics Panels */}
                        <div className="vehicle-diagnostics-grid">
                            
                            {/* Engine Component Intake Widget */}
                            <div className="diagnostic-widget widget-piston">
                                <div className="widget-header">
                                    <span className="telemetry-label" style={{ color: '#a5b4fc' }}>ENGINE INTAKE</span>
                                    <div className="widget-status">
                                        <span className="telemetry-indicator-dot neon-blue-dot"></span>
                                        ACTIVE
                                    </div>
                                </div>
                                <div className="widget-visual">
                                    <svg className="piston-svg" viewBox="0 0 100 100" width="80" height="80">
                                        {/* Cylinder Block */}
                                        <rect x="25" y="10" width="50" height="80" rx="3" fill="none" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="2" strokeDasharray="3 3" />
                                        {/* Piston Head */}
                                        <g className="piston-head-group">
                                            <rect x="30" y="25" width="40" height="25" rx="4" fill="url(#piston-gradient)" stroke="#00f2fe" strokeWidth="2" />
                                            <line x1="35" y1="33" x2="65" y2="33" stroke="rgba(11, 15, 25, 0.6)" strokeWidth="2" />
                                            <line x1="35" y1="40" x2="65" y2="40" stroke="rgba(11, 15, 25, 0.6)" strokeWidth="2" />
                                        </g>
                                        {/* Connecting Rod */}
                                        <g className="connecting-rod-group">
                                            <line x1="50" y1="45" x2="50" y2="70" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                                            <circle cx="50" cy="70" r="6" fill="#00f2fe" />
                                        </g>
                                        {/* Crankshaft */}
                                        <circle cx="50" cy="70" r="16" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
                                        
                                        <defs>
                                            <linearGradient id="piston-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#00f2fe" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="widget-readout">
                                        <div className="readout-value" style={{ color: '#ffffff' }}>7,200 RPM</div>
                                        <div className="readout-label" style={{ color: '#a5b4fc' }}>COMPRESSION 10.5:1</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Turbocharger Telemetry Widget */}
                            <div className="diagnostic-widget widget-turbo">
                                <div className="widget-header">
                                    <span className="telemetry-label" style={{ color: '#a5b4fc' }}>TURBO BOOST</span>
                                    <div className="widget-status">
                                        <span className="telemetry-indicator-dot neon-purple-dot"></span>
                                        OPTIMAL
                                    </div>
                                </div>
                                <div className="widget-visual">
                                    <svg className="turbo-gauge" viewBox="0 0 100 100" width="80" height="80">
                                        {/* Outer Dial Track */}
                                        <path d="M20,80 A40,40 0 1,1 80,80" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="8" strokeLinecap="round" />
                                        {/* Filled Dial Track */}
                                        <path d="M20,80 A40,40 0 1,1 72,40" fill="none" stroke="url(#turbo-gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="40" />
                                        {/* Ticks */}
                                        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="2 6" />
                                        {/* Sweeping Needle */}
                                        <g className="gauge-needle">
                                            <line x1="50" y1="50" x2="72" y2="35" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                                            <circle cx="50" cy="50" r="5" fill="#f43f5e" />
                                        </g>
                                        
                                        <defs>
                                            <linearGradient id="turbo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#00f2fe" />
                                                <stop offset="100%" stopColor="#f43f5e" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="widget-readout">
                                        <div className="readout-value" style={{ color: '#ffffff' }}>22.4 PSI</div>
                                        <div className="readout-label" style={{ color: '#a5b4fc' }}>TEMP: 104° C</div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        
                        {/* Bottom Live System Telemetry */}
                        <div className="bottom-telemetry-row">
                            <div className="telemetry-item">
                                <span className="item-label" style={{ color: '#a5b4fc' }}>INVENTORY STATUS</span>
                                <span className="item-value neon-cyan-text">98.2% FULL</span>
                            </div>
                            <div className="telemetry-item">
                                <span className="item-label" style={{ color: '#a5b4fc' }}>SYSTEM CORE</span>
                                <span className="item-value neon-green-text">ONLINE</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel: Cyber Signup Form Card */}
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
                                <h2 style={{ color: '#ffffff' }}>Welcome Back</h2>
                                <p className="subtitle" style={{ color: '#a5b4fc' }}>Secure system access initialization</p>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                
                                <div className="cyber-form-group">
                                    <label style={{ color: '#a5b4fc' }}>Email Address</label>
                                    <div className="cyber-input-wrapper">
                                        <span className="cyber-input-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                <polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                        </span>
                                        <input 
                                            type="email" 
                                            className="cyber-input"
                                            placeholder="admin@vehicleparts.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ color: '#ffffff' }}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="cyber-form-group">
                                    <label style={{ color: '#a5b4fc' }}>Password</label>
                                    <div className="cyber-input-wrapper">
                                        <span className="cyber-input-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                        </span>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="cyber-input"
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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

                                <div className="form-action-row">
                                    <label className="cyber-checkbox-container" style={{ color: '#94a3b8' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)} 
                                        />
                                        <span className="checkbox-checkmark"></span>
                                        Remember me
                                    </label>
                                    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                                </div>
                                
                                <button type="submit" className="cyber-button" disabled={loading}>
                                    {loading ? 'INITIALIZING ACCESS...' : 'SIGN IN'}
                                </button>
                            </form>
                            
                            <div className="cyber-footer" style={{ color: '#94a3b8' }}>
                                Don't have an account? <Link to="/register">Sign Up</Link>
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

export default Login;
