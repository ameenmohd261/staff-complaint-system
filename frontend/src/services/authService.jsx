import { v4 as uuidv4 } from 'uuid';
import storageService from './storageService';

// Keys for localStorage
const USER_KEY = 'complaint_management_user';
const USERS_KEY = 'complaint_management_users';

// Initialize demo users if not exist
const initializeDemoUsers = () => {
  const existingUsers = storageService.getItem(USERS_KEY);
  
  if (!existingUsers) {
    const demoUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'John Doe',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        phone: '555-1234',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Support Staff',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'staff',
        department: 'Support',
        createdAt: new Date().toISOString()
      }
    ];
    
    storageService.setItem(USERS_KEY, demoUsers);
  }
};

// Initialize demo data
initializeDemoUsers();

export const authService = {
  // Get current logged-in user
  getCurrentUser: async () => {
    return storageService.getItem(USER_KEY);
  },

  // Login user
  login: async (email, password) => {
    const users = storageService.getItem(USERS_KEY) || [];
    
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Remove password before storing in session
    const { password: _, ...userWithoutPassword } = user;
    storageService.setItem(USER_KEY, userWithoutPassword);
    
    return userWithoutPassword;
  },

  // Register new user
  register: async (userData) => {
    const users = storageService.getItem(USERS_KEY) || [];
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already in use');
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      role: userData.role || 'user', // Default role is user
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    storageService.setItem(USERS_KEY, users);
    
    // Login the user (store in session)
    const { password: _, ...userWithoutPassword } = newUser;
    storageService.setItem(USER_KEY, userWithoutPassword);
    
    return userWithoutPassword;
  },

  // Logout user
  logout: async () => {
    storageService.removeItem(USER_KEY);
    return true;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const currentUser = storageService.getItem(USER_KEY);
    const users = storageService.getItem(USERS_KEY) || [];
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    // Update user in users array
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        return { ...user, ...userData };
      }
      return user;
    });
    
    storageService.setItem(USERS_KEY, updatedUsers);
    
    // Update current user
    const updatedUser = { ...currentUser, ...userData };
    storageService.setItem(USER_KEY, updatedUser);
    
    return updatedUser;
  }
};