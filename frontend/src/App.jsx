import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import AppRoutes from './routes';
import AuthMiddleware from './components/AuthMiddleware';
import './assets/styles/App.css';
import './assets/styles/loading.css';

function App() {
  return (
    <AntdApp>
      <Router>
        <AuthMiddleware>
          <AppRoutes />
        </AuthMiddleware>
      </Router>
    </AntdApp>
  );
}

export default App;