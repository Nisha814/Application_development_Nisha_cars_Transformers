import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        // User not logged in
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // User role not allowed for this route
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
