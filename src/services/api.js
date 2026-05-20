import axios from 'axios';

const API_URL = 'http://localhost:5026/api'; 

const api = axios.create({
    baseURL: API_URL,
});

// Response interceptor to handle the consistent ApiResponse format
api.interceptors.response.use(
    (response) => {
        // If the response follows our ApiResponse format, unwrap the 'data' property
        if (response.data && response.data.hasOwnProperty('success')) {
            return {
                ...response,
                data: response.data.data,
                message: response.data.message,
                success: response.data.success
            };
        }
        return response;
    },
    (error) => {
        // If the error response follows our ApiResponse format, extract the message
        if (error.response && error.response.data && error.response.data.hasOwnProperty('success')) {
            error.message = error.response.data.message;
        }
        return Promise.reject(error);
    }
);

export const login = (email, password) => {
    return api.post('/auth/login', { email, password });
};

export const register = (userData) => {
    return api.post('/auth/register', userData);
};

export const verifyOtp = (email, otpCode) => {
    return api.post('/auth/verify-otp', { email, otpCode });
};

export const getDashboardOverview = () => {
    const token = localStorage.getItem('token');
    return api.get('/dashboard/overview', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getStaff = () => {
    const token = localStorage.getItem('token');
    return api.get('/staff', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addStaff = (staffData) => {
    const token = localStorage.getItem('token');
    return api.post('/staff', staffData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateStaff = (id, staffData) => {
    const token = localStorage.getItem('token');
    return api.put(`/staff/${id}`, staffData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteStaff = (id) => {
    const token = localStorage.getItem('token');
    return api.delete(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const toggleUserStatus = (id) => {
    const token = localStorage.getItem('token');
    return api.post(`/staff/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getVendors = () => {
    const token = localStorage.getItem('token');
    return api.get('/vendor', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addVendor = (vendorData) => {
    const token = localStorage.getItem('token');
    return api.post('/vendor', vendorData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateVendor = (id, vendorData) => {
    const token = localStorage.getItem('token');
    return api.put(`/vendor/${id}`, vendorData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteVendor = (id) => {
    const token = localStorage.getItem('token');
    return api.delete(`/vendor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateProfile = (profileData) => {
    const token = localStorage.getItem('token');
    return api.put('/profile/update', profileData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const uploadMedia = (file, type = 'profiles') => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/media/upload?type=${type}`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const searchCustomers = (term) => {
    const token = localStorage.getItem('token');
    return api.get(`/customer/search?term=${term}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getCustomers = () => {
    const token = localStorage.getItem('token');
    return api.get('/customer', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getCustomerHistory = (id) => {
    const token = localStorage.getItem('token');
    return api.get(`/customer/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addVehicle = (vehicleData) => {
    const token = localStorage.getItem('token');
    return api.post('/vehicle', vehicleData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getParts = () => {
    const token = localStorage.getItem('token');
    return api.get('/part', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const createSale = (saleData) => {
    const token = localStorage.getItem('token');
    return api.post('/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const payCredit = (creditId) => {
    const token = localStorage.getItem('token');
    return api.post(`/sales/credit/${creditId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteInventoryItem = (id) => {
    const token = localStorage.getItem('token');
    return api.delete(`/inventory/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Customer Portal endpoints
export const getPortalDashboard = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/dashboard', { headers: { Authorization: `Bearer ${token}` } });
};

export const getMyVehicles = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/vehicles', { headers: { Authorization: `Bearer ${token}` } });
};

export const getMyAppointments = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/appointments', { headers: { Authorization: `Bearer ${token}` } });
};

export const bookAppointment = (data) => {
    const token = localStorage.getItem('token');
    return api.post('/portal/appointments', data, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateAppointment = (id, data) => {
    const token = localStorage.getItem('token');
    return api.put(`/portal/appointments/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
};

export const cancelAppointment = (id) => {
    const token = localStorage.getItem('token');
    return api.post(`/portal/appointments/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

export const getMyReviews = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/reviews', { headers: { Authorization: `Bearer ${token}` } });
};

export const submitReview = (data) => {
    const token = localStorage.getItem('token');
    return api.post('/portal/reviews', data, { headers: { Authorization: `Bearer ${token}` } });
};

export const getMyPartRequests = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/partrequests', { headers: { Authorization: `Bearer ${token}` } });
};

export const submitPartRequest = (data) => {
    const token = localStorage.getItem('token');
    return api.post('/portal/partrequests', data, { headers: { Authorization: `Bearer ${token}` } });
};

export const getServiceHistory = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/service-history', { headers: { Authorization: `Bearer ${token}` } });
};

export const getMyPurchases = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/purchases', { headers: { Authorization: `Bearer ${token}` } });
};

export const getPendingPayments = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/pending-payments', { headers: { Authorization: `Bearer ${token}` } });
};

export const payMyCredit = (creditId) => {
    const token = localStorage.getItem('token');
    return api.post(`/portal/pending-payments/${creditId}/pay`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

export const getServiceCenter = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/service-center', { headers: { Authorization: `Bearer ${token}` } });
};

export const getNotifications = () => {
    const token = localStorage.getItem('token');
    return api.get('/portal/notifications', { headers: { Authorization: `Bearer ${token}` } });
};

export const markNotificationRead = (id) => {
    const token = localStorage.getItem('token');
    return api.post(`/portal/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Inventory & Stock Management
const inventoryHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getInventoryDashboard = () => api.get('/inventory/dashboard', inventoryHeaders());
export const getInventoryItems = () => api.get('/inventory/items', inventoryHeaders());
export const createInventoryItem = (data) => api.post('/inventory/items', data, inventoryHeaders());
export const updateInventoryItem = (id, data) => api.put(`/inventory/items/${id}`, data, inventoryHeaders());
export const stockIn = (data) => api.post('/inventory/stock-in', data, inventoryHeaders());
export const stockOut = (data) => api.post('/inventory/stock-out', data, inventoryHeaders());
export const getStockLogs = (params = {}) => {
    const q = new URLSearchParams();
    if (params.partId) q.append('partId', params.partId);
    if (params.movementType) q.append('movementType', params.movementType);
    return api.get(`/inventory/logs?${q}`, inventoryHeaders());
};
export const getStockAlerts = (activeOnly = true) => api.get(`/inventory/alerts?activeOnly=${activeOnly}`, inventoryHeaders());
export const resolveStockAlert = (id) => api.post(`/inventory/alerts/${id}/resolve`, {}, inventoryHeaders());
export const reportDamaged = (data) => api.post('/inventory/damaged', data, inventoryHeaders());
export const getDamagedStock = () => api.get('/inventory/damaged', inventoryHeaders());
export const getInventoryValuation = () => api.get('/inventory/valuation', inventoryHeaders());
export const getWarehouses = () => api.get('/inventory/warehouses', inventoryHeaders());
export const createWarehouse = (data) => api.post('/inventory/warehouses', data, inventoryHeaders());

export default api;
