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

export const resendOtp = (email) => {
    return api.post('/auth/resend-otp', { email });
};

export const logoutUser = () => {
    const token = sessionStorage.getItem('token');
    return api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getDashboardOverview = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/dashboard/overview', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getStaff = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/staff', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getCustomers = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/staff/customers', {
        headers: { Authorization: `Bearer ${token}` }
    });
};


export const addStaff = (staffData) => {
    const token = sessionStorage.getItem('token');
    return api.post('/staff', staffData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateStaff = (id, staffData) => {
    const token = sessionStorage.getItem('token');
    return api.put(`/staff/${id}`, staffData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteStaff = (id) => {
    const token = sessionStorage.getItem('token');
    return api.delete(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const toggleUserStatus = (id) => {
    const token = sessionStorage.getItem('token');
    return api.post(`/staff/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getVendors = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/vendor', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addVendor = (vendorData) => {
    const token = sessionStorage.getItem('token');
    return api.post('/vendor', vendorData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateVendor = (id, vendorData) => {
    const token = sessionStorage.getItem('token');
    return api.put(`/vendor/${id}`, vendorData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deleteVendor = (id) => {
    const token = sessionStorage.getItem('token');
    return api.delete(`/vendor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updateProfile = (profileData) => {
    const token = sessionStorage.getItem('token');
    return api.put('/profile/update', profileData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const uploadMedia = (file, type = 'profiles') => {
    const token = sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/media/upload?type=${type}`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getParts = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/parts', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addPart = (partData) => {
    const token = sessionStorage.getItem('token');
    return api.post('/parts', partData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const updatePart = (id, partData) => {
    const token = sessionStorage.getItem('token');
    return api.put(`/parts/${id}`, partData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const deletePart = (id) => {
    const token = sessionStorage.getItem('token');
    return api.delete(`/parts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getInvoices = () => {
    const token = sessionStorage.getItem('token');
    return api.get('/invoices', {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const createInvoice = (invoiceData) => {
    const token = sessionStorage.getItem('token');
    return api.post('/invoices', invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getFinancialReports = (period) => {
    const token = sessionStorage.getItem('token');
    return api.get(`/reports/financial?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export default api;
