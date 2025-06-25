import axios from 'axios';
import storageService from './storageService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Diagnostic function to test API connection and configuration
api.testConnection = async () => {
  try {
    // Try to hit a simple endpoint that should work without authentication
    const response = await api.get('/health');
    console.log('API connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      }
    };
  }
};

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = storageService.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track API error state
let hasUnauthorizedError = false;

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Only clear tokens if we haven't already had an unauthorized error
      // This prevents multiple simultaneous API calls from creating a mess
      if (!hasUnauthorizedError) {
        hasUnauthorizedError = true;
        console.log('Authentication error detected, clearing credentials');
        
        // Only clear tokens for specific auth-related endpoints
        // Don't clear for general API failures
        const isAuthRelatedEndpoint = error.config.url.includes('/users/profile') || 
                                     error.config.url.includes('/auth/') ||
                                     error.config.url.includes('/users/me');
        
        if (isAuthRelatedEndpoint) {
          storageService.removeItem('token');
          storageService.removeItem('complaint_management_user');
          console.log('Cleared tokens due to auth endpoint failure');
        } else {
          console.log('401 error on non-auth endpoint, keeping tokens');
        }
        
        // Reset the flag after a delay
        setTimeout(() => {
          hasUnauthorizedError = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
