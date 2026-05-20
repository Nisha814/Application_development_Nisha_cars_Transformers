import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerAppointments from './pages/CustomerAppointments';
import CustomerReviews from './pages/CustomerReviews';
import CustomerPartRequests from './pages/CustomerPartRequests';
import CustomerServiceHistory from './pages/CustomerServiceHistory';
import CustomerPurchases from './pages/CustomerPurchases';
import CustomerPayments from './pages/CustomerPayments';
import CustomerServiceCenter from './pages/CustomerServiceCenter';
import CustomerNotifications from './pages/CustomerNotifications';
import InventoryDashboard from './pages/InventoryDashboard';
import StockTracking from './pages/StockTracking';
import StockLogs from './pages/StockLogs';
import LowStockAlerts from './pages/LowStockAlerts';
import StaffManagement from './pages/StaffManagement';
import VendorManagement from './pages/VendorManagement';
import Profile from './pages/Profile';
import CustomerManagement from './pages/CustomerManagement';
import Billing from './pages/Billing';
import CustomerHistory from './pages/CustomerHistory';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ReportsPage from './pages/ReportsPage';
import PredictionsPage from './pages/PredictionsPage';
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
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
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
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['Admin']}><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['Admin']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/predictions" element={<ProtectedRoute allowedRoles={['Admin']}><PredictionsPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><InventoryDashboard /></ProtectedRoute>} />
        <Route path="/inventory/tracking" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><StockTracking /></ProtectedRoute>} />
        <Route path="/inventory/logs" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><StockLogs /></ProtectedRoute>} />
        <Route path="/inventory/alerts" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><LowStockAlerts /></ProtectedRoute>} />
        <Route 
          path="/staff/billing" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <Billing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/customer-history" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
              <CustomerHistory />
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
        <Route path="/customer/appointments" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerAppointments /></ProtectedRoute>} />
        <Route path="/customer/reviews" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerReviews /></ProtectedRoute>} />
        <Route path="/customer/requests" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerPartRequests /></ProtectedRoute>} />
        <Route path="/customer/service-history" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerServiceHistory /></ProtectedRoute>} />
        <Route path="/customer/purchases" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerPurchases /></ProtectedRoute>} />
        <Route path="/customer/payments" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerPayments /></ProtectedRoute>} />
        <Route path="/customer/service-center" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerServiceCenter /></ProtectedRoute>} />
        <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={['Customer']}><CustomerNotifications /></ProtectedRoute>} />
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
