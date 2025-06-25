import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthMiddleware = ({ children }) => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lastAuthCheck, setLastAuthCheck] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  useEffect(() => {
    // Only redirect after auth is initialized
    if (!isInitialized) return;
    
    // If already redirecting, don't check again
    if (redirecting) return;
    
    // Prevent too frequent checks (debounce)
    const now = Date.now();
    if (lastAuthCheck && now - lastAuthCheck < 1000) {
      return;
    }
    setLastAuthCheck(now);
    
    const currentPath = location.pathname;
    
    // Define paths
    const publicPaths = ['/', '/login', '/register'];
    const adminPaths = ['/admin', '/admin/dashboard', '/admin/complaints', '/admin/staff', 
                        '/admin/reports', '/admin/categories', '/admin/users'];
    const userPaths = ['/dashboard', '/complaints', '/new-complaint', '/profile'];
    
    // Current path characteristics 
    const isPublicPath = publicPaths.includes(currentPath);
    const isAdminPath = currentPath.startsWith('/admin');
    const isUserPath = userPaths.some(path => currentPath.startsWith(path));
    
    try {
      // Determine if redirection is needed
      let shouldRedirect = false;
      let redirectTo = null;
      
      if (!user) {
        // Not logged in - can only access public paths
        if (!isPublicPath) {
          shouldRedirect = true;
          redirectTo = '/login';
        }
      } else {
        // Logged in
        if (currentPath === '/') {
          // From homepage, redirect to appropriate dashboard
          shouldRedirect = true;
          redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        } else if (isPublicPath && currentPath !== '/') {
          // If on login/register page, redirect to dashboard
          shouldRedirect = true;
          redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        } else if (isAdminPath && user.role !== 'admin') {
          // If trying to access admin pages but not admin
          shouldRedirect = true;
          redirectTo = '/dashboard';
        }
      }
      
      // Handle redirection
      if (shouldRedirect && redirectTo) {
        console.log(`AuthMiddleware: Redirecting from ${currentPath} to ${redirectTo}`);
        setRedirecting(true);
        navigate(redirectTo, { replace: true });
        
        // Reset redirecting flag after delay
        setTimeout(() => {
          setRedirecting(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Reset redirecting in case of error
      setRedirecting(false);
    }
  }, [isInitialized, user, navigate, location.pathname, lastAuthCheck, redirecting]);

  // Show loading while auth initializes
  if (!isInitialized) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return children;
};

export default AuthMiddleware;
