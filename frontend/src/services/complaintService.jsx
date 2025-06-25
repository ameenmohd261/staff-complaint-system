import api from './apiService';

export const complaintService = {
  // Complaint CRUD operations
  getAllComplaints: async () => {
    try {
      const response = await api.get('/complaints');
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },
  
  getUserComplaints: async (userId) => {
    try {
      const response = await api.get(`/complaints/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      throw error;
    }
  },
  
  getComplaintById: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching complaint ${id}:`, error);
      throw error;
    }
  },
    createComplaint: async (complaintData) => {
    try {
      // Log the complaint data being sent for debugging
      console.log('Creating complaint with data:', complaintData);
      
      // Handle file uploads if included in the complaint data
      if (complaintData.attachments) {
        const formData = new FormData();
        
        // Append all fields to formData
        Object.keys(complaintData).forEach(key => {
          if (key !== 'attachments') {
            console.log(`Adding form field: ${key} = ${complaintData[key]}`);
            formData.append(key, complaintData[key]);
          }
        });
        
        // Append files
        if (complaintData.attachments.length > 0) {
          for (let i = 0; i < complaintData.attachments.length; i++) {
            formData.append('attachments', complaintData.attachments[i]);
          }
        }
        
        console.log('Sending form data to API');
        const response = await api.post('/complaints', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Response from API:', response.data);
        return response.data;
      } else {
        // Regular JSON request if no attachments
        console.log('Sending JSON data to API');
        const response = await api.post('/complaints', complaintData);
        console.log('Response from API:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  },
  
  updateComplaint: async (id, complaintData) => {
    try {
      const response = await api.put(`/complaints/${id}`, complaintData);
      return response.data;
    } catch (error) {
      console.error(`Error updating complaint ${id}:`, error);
      throw error;
    }
  },
  
  deleteComplaint: async (id) => {
    try {
      await api.delete(`/complaints/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting complaint ${id}:`, error);
      throw error;
    }
  },
  
  // Status operations
  updateComplaintStatus: async (id, statusId, remarks) => {
    try {
      const response = await api.put(`/complaints/${id}/status`, { status: statusId, remarks });
      return response.data;
    } catch (error) {
      console.error(`Error updating complaint ${id} status:`, error);
      throw error;
    }
  },
  
  getStatusHistory: async (complaintId) => {
    try {
      const response = await api.get(`/complaints/${complaintId}/status-history`);
      return response.data;
    } catch (error) {
      console.error(`Error getting status history for complaint ${complaintId}:`, error);
      throw error;
    }
  },
  
  getAllStatuses: async () => {
    try {
      const response = await api.get('/statuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      throw error;
    }
  },
  
  // Assignment operations
  assignComplaint: async (id, staffId) => {
    try {
      const response = await api.put(`/complaints/${id}/assign`, { staffId });
      return response.data;
    } catch (error) {
      console.error(`Error assigning complaint ${id}:`, error);
      throw error;
    }
  },
  
  // Comment operations
  getComments: async (complaintId) => {
    try {
      const response = await api.get(`/complaints/${complaintId}/comments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for complaint ${complaintId}:`, error);
      throw error;
    }
  },
  
  addComment: async (complaintId, content) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to complaint ${complaintId}:`, error);
      throw error;
    }
  },
    // Category operations
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories received from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },
  
  // Dashboard data
  getDashboardStats: async (userType, userId = null) => {
    try {
      const endpoint = userId 
        ? `/dashboard/${userType}/${userId}` 
        : `/dashboard/${userType}`;
        
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  // Reports data for admin dashboard
  getReportData: async (filters = {}) => {
    try {
      const response = await api.get('/reports/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  },
  
  // My Complaints
  getMyComplaints: async () => {
    try {
      const response = await api.get('/complaints/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my complaints:', error);
      throw error;
    }
  }
};
