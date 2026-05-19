import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('fullName', response.data.fullName);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('profilePictureUrl', response.data.profilePictureUrl || '');
            
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
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Please enter your details to sign in</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
