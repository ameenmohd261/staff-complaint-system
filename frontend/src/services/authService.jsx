import storageService from './storageService';
import api from './apiService';

// Keys for localStorage
const USER_KEY = 'complaint_management_user';
const TOKEN_EXPIRY_KEY = 'complaint_management_token_expiry';

// Helper function to check if token is expired
const isTokenExpired = () => {
  const expiryTime = storageService.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;
  
  return Date.now() > expiryTime;
};

// Helper function to set token expiry (24 hours from now)
const setTokenExpiry = () => {
  const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  storageService.setItem(TOKEN_EXPIRY_KEY, expiryTime);
};

// Helper function to clear all auth data
const clearAuthData = () => {
  storageService.removeItem('token');
  storageService.removeItem(USER_KEY);
  storageService.removeItem(TOKEN_EXPIRY_KEY);
};

export const authService = {  // Get current logged-in user
  getCurrentUser: async () => {
    try {
      // Check if we have a stored token
      const token = storageService.getItem('token');
      if (!token) {
        console.log('No token found');
        return null;
      }
      
      // Check if token is expired (24 hours)
      if (isTokenExpired()) {
        console.log('Token has expired, clearing auth data');
        clearAuthData();
        return null;
      }
      
      // Check if we have a stored user
      const user = storageService.getItem(USER_KEY);
      
      // If we have both token and user, return the user without verification
      // This prevents auto-logout on page refresh
      if (user && token) {
        console.log('Found stored user with valid token, returning without verification:', user);
        return user;
      }
      
      // Only verify token if we don't have stored user data
      console.log('No stored user found, verifying token with server...');
      const response = await api.get('/users/profile');
      const updatedUser = response.data;
      storageService.setItem(USER_KEY, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error verifying authentication:', error);
      
      // Only clear tokens if the error is specifically a 401 (unauthorized)
      // Don't clear on network errors, server errors, etc.
      if (error.response && error.response.status === 401) {
        console.log('Token is invalid (401), clearing authentication');
        clearAuthData();
      } else {
        console.log('Non-auth error during verification, keeping stored user');
        // Return stored user if available, even if verification failed
        const storedUser = storageService.getItem(USER_KEY);
        if (storedUser) {
          return storedUser;
        }
      }
      
      return null;
    }
  },
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token and user data with expiry
      storageService.setItem('token', token);
      storageService.setItem(USER_KEY, user);
      setTokenExpiry(); // Set 24-hour expiry
      
      console.log('Login successful, token expiry set for 24 hours');
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    }
  },// Register new user
  register: async (userData) => {
    try {
      // Set default role to employee if not specified
      if (!userData.role) {
        userData.role = 'employee';
      }
        // Important: The backend model ONLY accepts 'admin' or 'employee' as valid roles
      // The backend may be trying to set a default of 'user' which is invalid
      userData.role = 'employee';  // Always set to 'employee' for new registrations
      
      console.log('Sending registration data:', userData);
      
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
        // Store token and user data with expiry
      storageService.setItem('token', token);
      storageService.setItem(USER_KEY, user);
      setTokenExpiry(); // Set 24-hour expiry
      
      console.log('Registration successful, token expiry set for 24 hours');
      return user;
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Extract detailed error message from response if available
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.error?.message) || 
                          'Registration failed';
                          
      throw new Error(errorMessage);
    }
  },
  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear all auth data regardless of API success
      clearAuthData();
      console.log('All authentication data cleared');
      return true;
    }
  },
  // Update user profile
  updateProfile: async (userData) => {
    try {
      const currentUser = storageService.getItem(USER_KEY);
      
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      
      const response = await api.put('/users/profile', userData);
      const updatedUser = response.data;
      
      // Update stored user data
      storageService.setItem(USER_KEY, updatedUser);
        return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Check if current session is valid
  isSessionValid: () => {
    const token = storageService.getItem('token');
    const user = storageService.getItem(USER_KEY);
    return token && user && !isTokenExpired();
  },

  // Get remaining session time in milliseconds
  getRemainingSessionTime: () => {
    const expiryTime = storageService.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return 0;
    
    const remaining = expiryTime - Date.now();
    return Math.max(0, remaining);
  }
};