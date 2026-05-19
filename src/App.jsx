import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffManagement from './pages/StaffManagement';
import VendorManagement from './pages/VendorManagement';
import Profile from './pages/Profile';
import CustomerManagement from './pages/CustomerManagement';
import { Toaster } from 'react-hot-toast';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/staff" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <StaffManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/customers" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <CustomerManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/vendors" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <VendorManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
