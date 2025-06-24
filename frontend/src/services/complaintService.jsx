import { v4 as uuidv4 } from 'uuid';
import storageService from './storageService';

// Keys for localStorage
const COMPLAINTS_KEY = 'complaint_management_complaints';
const CATEGORIES_KEY = 'complaint_management_categories';
const STATUSES_KEY = 'complaint_management_statuses';
const COMMENTS_KEY = 'complaint_management_comments';
const STATUS_HISTORY_KEY = 'complaint_management_status_history';

// Initialize demo data if not exist
const initializeDemoData = () => {
  // Initialize categories
  if (!storageService.getItem(CATEGORIES_KEY)) {
    const demoCategories = [
      { id: '1', name: 'Technical Issue', description: 'Problems with software or hardware' },
      { id: '2', name: 'Billing Problem', description: 'Issues related to billing or payments' },
      { id: '3', name: 'Service Quality', description: 'Complaints about service quality' },
      { id: '4', name: 'Product Defect', description: 'Issues with product functionality' },
      { id: '5', name: 'Customer Service', description: 'Complaints about staff behavior or service' }
    ];
    storageService.setItem(CATEGORIES_KEY, demoCategories);
  }

  // Initialize statuses
  if (!storageService.getItem(STATUSES_KEY)) {
    const demoStatuses = [
      { id: '1', name: 'New', color: '#1890ff' },
      { id: '2', name: 'In Progress', color: '#faad14' },
      { id: '3', name: 'Pending Customer', color: '#722ed1' },
      { id: '4', name: 'Resolved', color: '#52c41a' },
      { id: '5', name: 'Closed', color: '#d9d9d9' },
      { id: '6', name: 'Reopened', color: '#f5222d' }
    ];
    storageService.setItem(STATUSES_KEY, demoStatuses);
  }

  // Initialize complaints
  if (!storageService.getItem(COMPLAINTS_KEY)) {
    const currentDate = new Date();
    const demoComplaints = [
      {
        id: '1',
        userId: '2', // John Doe
        categoryId: '1',
        subject: 'Website is not loading properly',
        description: 'I am unable to access the website. It keeps showing error 500.',
        status: '1', // New
        priority: 'High',
        createdAt: new Date(currentDate - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(currentDate - 86400000 * 2).toISOString(),
        assignedTo: null,
        attachments: []
      },
      {
        id: '2',
        userId: '2', // John Doe
        categoryId: '2',
        subject: 'Double charged for monthly subscription',
        description: 'I was charged twice for my monthly subscription on May 15.',
        status: '2', // In Progress
        priority: 'Medium',
        createdAt: new Date(currentDate - 86400000 * 5).toISOString(), // 5 days ago
        updatedAt: new Date(currentDate - 86400000 * 3).toISOString(), // 3 days ago
        assignedTo: '3', // Support Staff
        attachments: []
      },
      {
        id: '3',
        userId: '2', // John Doe
        categoryId: '5',
        subject: 'Rude customer service representative',
        description: 'The support staff was very rude when I called about my issue.',
        status: '4', // Resolved
        priority: 'Low',
        createdAt: new Date(currentDate - 86400000 * 10).toISOString(), // 10 days ago
        updatedAt: new Date(currentDate - 86400000 * 8).toISOString(), // 8 days ago
        assignedTo: '3', // Support Staff
        attachments: [],
        satisfaction: 4
      }
    ];
    storageService.setItem(COMPLAINTS_KEY, demoComplaints);

    // Initialize status history
    const demoStatusHistory = [
      {
        id: '1',
        complaintId: '1',
        status: '1', // New
        timestamp: new Date(currentDate - 86400000 * 2).toISOString(),
        updatedBy: '2' // John Doe (self)
      },
      {
        id: '2',
        complaintId: '2',
        status: '1', // New
        timestamp: new Date(currentDate - 86400000 * 5).toISOString(),
        updatedBy: '2' // John Doe (self)
      },
      {
        id: '3',
        complaintId: '2',
        status: '2', // In Progress
        timestamp: new Date(currentDate - 86400000 * 3).toISOString(),
        updatedBy: '3' // Support Staff
      },
      {
        id: '4',
        complaintId: '3',
        status: '1', // New
        timestamp: new Date(currentDate - 86400000 * 10).toISOString(),
        updatedBy: '2' // John Doe (self)
      },
      {
        id: '5',
        complaintId: '3',
        status: '2', // In Progress
        timestamp: new Date(currentDate - 86400000 * 9).toISOString(),
        updatedBy: '3' // Support Staff
      },
      {
        id: '6',
        complaintId: '3',
        status: '4', // Resolved
        timestamp: new Date(currentDate - 86400000 * 8).toISOString(),
        updatedBy: '3' // Support Staff
      }
    ];
    storageService.setItem(STATUS_HISTORY_KEY, demoStatusHistory);

    // Initialize comments
    const demoComments = [
      {
        id: '1',
        complaintId: '2',
        userId: '3', // Support Staff
        comment: 'We are looking into this issue and will get back to you soon.',
        timestamp: new Date(currentDate - 86400000 * 4).toISOString() // 4 days ago
      },
      {
        id: '2',
        complaintId: '2',
        userId: '2', // John Doe
        comment: 'Thank you. I appreciate your help.',
        timestamp: new Date(currentDate - 86400000 * 3.9).toISOString() // 3.9 days ago
      },
      {
        id: '3',
        complaintId: '3',
        userId: '3', // Support Staff
        comment: 'I apologize for the poor experience. We have addressed this with our team.',
        timestamp: new Date(currentDate - 86400000 * 8.5).toISOString() // 8.5 days ago
      }
    ];
    storageService.setItem(COMMENTS_KEY, demoComments);
  }
};

// Initialize demo data
initializeDemoData();

export const complaintService = {
  // Get all complaints
  getAllComplaints: async () => {
    return storageService.getItem(COMPLAINTS_KEY) || [];
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    return complaints.find(c => c.id === id);
  },

  // Get complaints by user ID
  getComplaintsByUserId: async (userId) => {
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    return complaints.filter(c => c.userId === userId);
  },

  // Create new complaint
  createComplaint: async (complaintData) => {
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    const currentUser = storageService.getItem('complaint_management_user');
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const newComplaint = {
      id: uuidv4(),
      userId: currentUser.id,
      status: '1', // Default to 'New'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null,
      attachments: [],
      ...complaintData
    };

    complaints.push(newComplaint);
    storageService.setItem(COMPLAINTS_KEY, complaints);

    // Add status history
    const statusHistory = storageService.getItem(STATUS_HISTORY_KEY) || [];
    const newStatusHistory = {
      id: uuidv4(),
      complaintId: newComplaint.id,
      status: newComplaint.status,
      timestamp: newComplaint.createdAt,
      updatedBy: currentUser.id
    };
    statusHistory.push(newStatusHistory);
    storageService.setItem(STATUS_HISTORY_KEY, statusHistory);

    return newComplaint;
  },

  // Update complaint
  updateComplaint: async (id, complaintData) => {
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    const currentUser = storageService.getItem('complaint_management_user');
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    let statusChanged = false;
    let oldStatus = '';
    let newStatus = '';

    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === id) {
        if (complaintData.status && complaint.status !== complaintData.status) {
          statusChanged = true;
          oldStatus = complaint.status;
          newStatus = complaintData.status;
        }

        return {
          ...complaint,
          ...complaintData,
          updatedAt: new Date().toISOString()
        };
      }
      return complaint;
    });

    storageService.setItem(COMPLAINTS_KEY, updatedComplaints);

    // If status changed, add to status history
    if (statusChanged) {
      const statusHistory = storageService.getItem(STATUS_HISTORY_KEY) || [];
      const newStatusHistory = {
        id: uuidv4(),
        complaintId: id,
        status: newStatus,
        timestamp: new Date().toISOString(),
        updatedBy: currentUser.id
      };
      statusHistory.push(newStatusHistory);
      storageService.setItem(STATUS_HISTORY_KEY, statusHistory);
    }

    return updatedComplaints.find(c => c.id === id);
  },

  // Delete complaint
  deleteComplaint: async (id) => {
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    const filteredComplaints = complaints.filter(c => c.id !== id);
    storageService.setItem(COMPLAINTS_KEY, filteredComplaints);

    // Delete related data
    const comments = storageService.getItem(COMMENTS_KEY) || [];
    const filteredComments = comments.filter(c => c.complaintId !== id);
    storageService.setItem(COMMENTS_KEY, filteredComments);

    const statusHistory = storageService.getItem(STATUS_HISTORY_KEY) || [];
    const filteredStatusHistory = statusHistory.filter(s => s.complaintId !== id);
    storageService.setItem(STATUS_HISTORY_KEY, filteredStatusHistory);

    return true;
  },

  // Get all categories
  getAllCategories: async () => {
    return storageService.getItem(CATEGORIES_KEY) || [];
  },

  // Create category
  createCategory: async (categoryData) => {
    const categories = storageService.getItem(CATEGORIES_KEY) || [];
    
    const newCategory = {
      id: uuidv4(),
      ...categoryData
    };

    categories.push(newCategory);
    storageService.setItem(CATEGORIES_KEY, categories);

    return newCategory;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const categories = storageService.getItem(CATEGORIES_KEY) || [];
    
    const updatedCategories = categories.map(category => {
      if (category.id === id) {
        return { ...category, ...categoryData };
      }
      return category;
    });

    storageService.setItem(CATEGORIES_KEY, updatedCategories);
    return updatedCategories.find(c => c.id === id);
  },

  // Delete category
  deleteCategory: async (id) => {
    const categories = storageService.getItem(CATEGORIES_KEY) || [];
    const filteredCategories = categories.filter(c => c.id !== id);
    storageService.setItem(CATEGORIES_KEY, filteredCategories);
    return true;
  },

  // Get all statuses
  getAllStatuses: async () => {
    return storageService.getItem(STATUSES_KEY) || [];
  },

  // Get status history for a complaint
  getStatusHistory: async (complaintId) => {
    const statusHistory = storageService.getItem(STATUS_HISTORY_KEY) || [];
    return statusHistory.filter(s => s.complaintId === complaintId);
  },

  // Get comments for a complaint
  getComments: async (complaintId) => {
    const comments = storageService.getItem(COMMENTS_KEY) || [];
    return comments.filter(c => c.complaintId === complaintId);
  },

  // Add comment to a complaint
  addComment: async (complaintId, comment) => {
    const comments = storageService.getItem(COMMENTS_KEY) || [];
    const currentUser = storageService.getItem('complaint_management_user');
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const newComment = {
      id: uuidv4(),
      complaintId,
      userId: currentUser.id,
      comment,
      timestamp: new Date().toISOString()
    };

    comments.push(newComment);
    storageService.setItem(COMMENTS_KEY, comments);

    // Update the complaint's updatedAt timestamp
    const complaints = storageService.getItem(COMPLAINTS_KEY) || [];
    const updatedComplaints = complaints.map(c => {
      if (c.id === complaintId) {
        return { ...c, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    storageService.setItem(COMPLAINTS_KEY, updatedComplaints);

    return newComment;
  }
};