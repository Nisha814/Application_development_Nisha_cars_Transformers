import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
    <div className="auth-container">
        <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
        <p className="subtitle">You do not have permission to view this page</p>
        <div className="message error">Error 403: Forbidden</div>
        <button onClick={() => window.history.back()}>Go Back</button>
        <div className="auth-footer" style={{ marginTop: '20px' }}>
            <Link to="/login">Back to Login</Link>
        </div>
    </div>
);

export default Unauthorized;
