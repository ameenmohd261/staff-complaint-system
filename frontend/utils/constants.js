// Application Constants

// Roles
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user'
};

// Complaint Statuses
export const COMPLAINT_STATUSES = {
  NEW: '1',
  IN_PROGRESS: '2',
  PENDING_CUSTOMER: '3',
  RESOLVED: '4',
  CLOSED: '5',
  REOPENED: '6'
};

// Complaint Priorities
export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'complaint_management_user',
  USERS: 'complaint_management_users',
  COMPLAINTS: 'complaint_management_complaints',
  CATEGORIES: 'complaint_management_categories',
  STATUSES: 'complaint_management_statuses',
  COMMENTS: 'complaint_management_comments',
  STATUS_HISTORY: 'complaint_management_status_history'
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  USERS: '/api/users',
  COMPLAINTS: '/api/complaints',
  CATEGORIES: '/api/categories',
  COMMENTS: '/api/comments',
  STATUS_HISTORY: '/api/status-history',
  DASHBOARD: '/api/dashboard',
  REPORTS: '/api/reports'
};

// Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
  MAX_COUNT: 5
};

// Chart Colors
export const CHART_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16'
];

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Network error. Please check your connection.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  COMPLAINT_CREATED: 'Complaint submitted successfully.',
  COMPLAINT_UPDATED: 'Complaint updated successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  COMMENT_ADDED: 'Comment added successfully.'
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  USER_DASHBOARD: '/dashboard',
  USER_COMPLAINTS: '/complaints',
  USER_NEW_COMPLAINT: '/new-complaint',
  USER_PROFILE: '/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports'
};