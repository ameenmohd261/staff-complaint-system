import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Custom hook to handle authentication redirects
export const useAuthRedirect = () => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect after auth is initialized
    if (!isInitialized) return;
    
    // Get the path they were trying to access
    const from = location.state?.from?.pathname || '/';
    
    // Auth paths that don't require redirection when logged out
    const authPaths = ['/login', '/register'];
    
    // Admin and user paths
    const adminPaths = ['/admin', '/admin/', '/admin/dashboard'];
    const userPaths = ['/dashboard', '/complaints', '/new-complaint', '/profile'];
    
    if (user) {
      // User is logged in
      if (authPaths.includes(location.pathname)) {
        // If on login/register page, redirect to appropriate dashboard
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else if (user.role !== 'admin' && location.pathname.startsWith('/admin')) {
        // If not admin but trying to access admin pages
        navigate('/dashboard');
      }
    } else if (!user && !authPaths.includes(location.pathname)) {
      // User is not logged in and trying to access protected page
      navigate('/login', { state: { from: location } });
    }
  }, [isInitialized, user, navigate, location]);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          console.log('Authentication initialized successfully:', currentUser);
          setUser(currentUser);
        } else {
          console.log('No valid authentication found');
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        // Ensure we clean up if initialization fails
        setUser(null);
      } finally {
        // Always set initialization to complete even if auth fails
        setIsInitialized(true);
        console.log('Authentication initialization completed');
      }
    };

    initializeAuth();
  }, []);
  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const register = async (userData) => {
    try {
      console.log('AuthContext: Registering with data:', { ...userData, password: '[REDACTED]' });
      const user = await authService.register(userData);
      console.log('AuthContext: Registration successful, user data:', user);
      setUser(user);
      return user;
    } catch (error) {
      console.error('AuthContext: Register error:', error);
      // Make sure we're throwing an Error object
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(typeof error === 'string' ? error : 'Registration failed');
      }
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isInitialized,
      login, 
      register, 
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};