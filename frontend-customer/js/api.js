const BASE_URL = 'http://localhost:5156/api';

const api = {
  // Store authentication data
  setAuth(data) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user_id', data.id);
    localStorage.setItem('auth_user_name', data.fullName);
    localStorage.setItem('auth_user_email', data.email);
  },

  // Clear authentication data (logout)
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_name');
    localStorage.removeItem('auth_user_email');
    window.location.href = 'index.html';
  },

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('auth_token') !== null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Get user details
  getUser() {
    return {
      id: localStorage.getItem('auth_user_id'),
      fullName: localStorage.getItem('auth_user_name'),
      email: localStorage.getItem('auth_user_email')
    };
  },

  // Generic request handler
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    // Setup headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${BASE_URL}/${endpoint}`, config);
      
      // Handle unauthorized (expired token, etc.)
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },

  // HTTP Helper methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
