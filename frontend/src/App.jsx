import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { useAuth } from './contexts/AuthContext';
// import 'antd/dist/reset.css';
import './assets/styles/App.css';

function App() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;