import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

// Layout Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Footer from './components/layout/Footer';

// Auth Components
import Register from './components/auth/Register';
import Login from './components/auth/Login';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import DepartmentHeadDashboard from './components/dashboard/DepartmentHeadDashboard';

// Complaint Components
import CreateComplaint from './components/complaints/CreateComplaint';
import ComplaintDetail from './components/complaints/ComplaintDetail';
import ComplaintsList from './components/complaints/ComplaintsList';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import Analytics from './components/admin/Analytics';

// Routing Components
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// Redux
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <Navbar />
          <Alert />
          <main className="container py-4">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              
              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-complaint" element={<CreateComplaint />} />
                <Route path="/complaints" element={<ComplaintsList />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/departments" element={<DepartmentManagement />} />
                <Route path="/admin/analytics" element={<Analytics />} />
              </Route>
              
              {/* Department Head Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dept-head/dashboard" element={<DepartmentHeadDashboard />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;