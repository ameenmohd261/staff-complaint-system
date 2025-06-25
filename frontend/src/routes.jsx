import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Pages
import UserDashboardPage from './pages/user/DashboardPage';
import NewComplaintPage from './pages/user/NewComplaintPage';
import ComplaintHistoryPage from './pages/user/ComplaintHistoryPage';
import ComplaintDetailPage from './pages/user/ComplaintDetailPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import ComplaintsPage from './pages/admin/ComplaintsPage';
import StaffPage from './pages/admin/StaffPage';
import ReportsPage from './pages/admin/ReportsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import UsersPage from './pages/admin/UsersPage';
import HomePage from './pages/HomePage';
import AdminComplaintDetailPage from './pages/admin/ComplaintDetailPage';


const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage></HomePage>} />
         <Route path="/admin/complaints-details" element={<AdminComplaintDetailPage></AdminComplaintDetailPage>} />
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* User Routes */}
      <Route 
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role === 'user'}
            redirectPath="/login"
          >
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/new-complaint" element={<NewComplaintPage />} />
        <Route path="/complaints" element={<ComplaintHistoryPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route 
        element={
          <ProtectedRoute
            isAllowed={!!user && user.role === 'admin'}
            redirectPath="/login"
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/complaints" element={<ComplaintsPage />} />
        <Route path="/admin/staff" element={<StaffPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
      
        <Route path="/admin/users" element={<UsersPage />} />
      </Route>
      
      {/* Redirect based on role */}
      <Route path="/" element={
        <Navigate to={
          !user ? "/login" : 
          user.role === 'admin' ? "/admin/dashboard" : "/dashboard"
        } replace />
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Protected Route component
const ProtectedRoute = ({ isAllowed, redirectPath, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default AppRoutes;