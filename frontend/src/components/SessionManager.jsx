import React, { useEffect, useState } from 'react';
import { Modal, Button, notification } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const SessionManager = () => {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const remaining = authService.getRemainingSessionTime();
      setRemainingTime(remaining);

      // Show warning when 5 minutes (300000ms) remain
      if (remaining <= 300000 && remaining > 0) {
        setShowWarning(true);
      }

      // Auto logout when session expires
      if (remaining <= 0) {
        handleSessionExpired();
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [user]);

  const handleSessionExpired = async () => {
    notification.warning({
      message: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      duration: 5,
    });
    
    await logout();
    setShowWarning(false);
  };

  const handleExtendSession = () => {
    // For now, just hide the warning
    // In a real app, you might want to make an API call to refresh the token
    setShowWarning(false);
    notification.success({
      message: 'Session Extended',
      description: 'Your session will remain active.',
      duration: 3,
    });
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (!user) return null;

  return (
    <Modal
      title="Session Warning"
      open={showWarning}
      footer={[
        <Button key="logout" onClick={handleSessionExpired}>
          Logout Now
        </Button>,
        <Button key="extend" type="primary" onClick={handleExtendSession}>
          Continue Session
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <p>
        Your session will expire in {formatTime(remainingTime)}. 
        Would you like to continue your session or logout?
      </p>
    </Modal>
  );
};

export default SessionManager;
