import api from './apiService';

export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },
  
  // Get all staff members (employees and admins)
  getAllStaff: async () => {
    try {
      // Get employees with role filter
      const response = await api.get('/users', {
        params: { role: 'employee,admin' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  },
  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Create staff member (employee)
  createStaff: async (userData) => {
    try {
      // Set default role to employee if not specified
      if (!userData.role) {
        userData.role = 'employee';
      }
      
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create employee');
    }
  },
  // Update staff member (employee)
  updateStaff: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update employee');
    }
  },

  // Delete staff member (employee)
  deleteStaff: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete employee');
    }
  }
};