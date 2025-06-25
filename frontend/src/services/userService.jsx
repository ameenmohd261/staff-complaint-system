import { v4 as uuidv4 } from 'uuid';
import storageService from './storageService';

// Keys for localStorage
const USERS_KEY = 'complaint_management_users';

export const userService = {
  // Get all users
  getAllUsers: async () => {
    const users = storageService.getItem(USERS_KEY) || [];
    // Return users without passwords
    return users.map(({ password, ...user }) => user);
  },

  // Get all staff members
  getAllStaff: async () => {
    const users = storageService.getItem(USERS_KEY) || [];
    // Return staff and admin users without passwords
    return users
      .filter(user => user.role === 'staff' || user.role === 'admin')
      .map(({ password, ...user }) => user);
  },

  // Get user by ID
  getUserById: async (id) => {
    const users = storageService.getItem(USERS_KEY) || [];
    const user = users.find(u => u.id === id);
    
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Create staff member
  createStaff: async (userData) => {
    const users = storageService.getItem(USERS_KEY) || [];
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already in use');
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      role: userData.role || 'staff', // Default role is staff
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    storageService.setItem(USERS_KEY, users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // Update staff member
  updateStaff: async (id, userData) => {
    const users = storageService.getItem(USERS_KEY) || [];
    
    // Update user in users array
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, ...userData };
      }
      return user;
    });
    
    storageService.setItem(USERS_KEY, updatedUsers);
    
    // Return updated user without password
    const updatedUser = updatedUsers.find(u => u.id === id);
    if (!updatedUser) throw new Error('User not found');
    
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  // Delete staff member
  deleteStaff: async (id) => {
    const users = storageService.getItem(USERS_KEY) || [];
    
    // Remove user from users array
    const filteredUsers = users.filter(user => user.id !== id);
    storageService.setItem(USERS_KEY, filteredUsers);
    
    return true;
  }
};