import React from 'react';
import { Space } from 'antd';
import styled from 'styled-components';

const AlertContainer = styled.div`
  padding: 8px 15px;
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return '#f6ffed';
      case 'info':
        return '#e6f7ff';
      case 'warning':
        return '#fffbe6';
      case 'error':
        return '#fff2f0';
      default:
        return '#e6f7ff';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success':
        return '#b7eb8f';
      case 'info':
        return '#91d5ff';
      case 'warning':
        return '#ffe58f';
      case 'error':
        return '#ffccc7';
      default:
        return '#91d5ff';
    }
  }};
`;

const IconContainer = styled.div`
  font-size: 16px;
  padding-right: 12px;
  color: ${props => {
    switch (props.type) {
      case 'success':
        return '#52c41a';
      case 'info':
        return '#1890ff';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  }};
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const MessageTitle = styled.div`
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  margin-bottom: ${props => props.description ? '4px' : '0'};
`;

const MessageDescription = styled.div`
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
`;

const Alert = ({ message, description, type = 'info', showIcon = false, icon, style = {} }) => {
  // Default icons based on type
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircleOutlined />;
      case 'info':
        return <InfoCircleOutlined />;
      case 'warning':
        return <ExclamationCircleOutlined />;
      case 'error':
        return <CloseCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };
  
  return (
    <AlertContainer type={type} style={style}>
      {showIcon && (
        <IconContainer type={type}>
          {getIcon()}
        </IconContainer>
      )}
      
      <ContentContainer>
        {message && <MessageTitle description={description}>{message}</MessageTitle>}
        {description && <MessageDescription>{description}</MessageDescription>}
      </ContentContainer>
    </AlertContainer>
  );
};

export default Alert;