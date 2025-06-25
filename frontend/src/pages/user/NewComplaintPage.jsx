import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Button, Upload, Card, 
  Typography, message, Divider, Space 
} from 'antd';
import { 
  UploadOutlined, SendOutlined, SaveOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
`;

const FormHeader = styled.div`
  margin-bottom: 24px;
`;

const NewComplaintPage = () => {
  const { categories, addComplaint } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [manualCategories, setManualCategories] = useState([]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      message.warning('Please log in to submit a complaint');
      navigate('/login', { state: { from: '/new-complaint' } });
      return;
    }
  }, [user, navigate]);
  
  // Don't render the form if user is not authenticated
  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  // Debug categories
  console.log('Categories in NewComplaintPage:', categories);
  console.log('Categories type:', typeof categories);
  console.log('Categories is array:', Array.isArray(categories));
  console.log('Current user:', user);
  
  // Manual category fetch as fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('NewComplaintPage: Manually fetching categories...');
        const data = await complaintService.getAllCategories();
        console.log('NewComplaintPage: Manual fetch result:', data);
        setManualCategories(data || []);
      } catch (error) {
        console.error('NewComplaintPage: Manual fetch error:', error);
        setManualCategories([]);
      }
    };
    
    // If categories from context are not available, fetch manually
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      fetchCategories();
    }
  }, [categories]);
    // Use categories from context or fallback to manual fetch
  const availableCategories = React.useMemo(() => {
    const sourceCategories = (Array.isArray(categories) && categories.length > 0) 
      ? categories 
      : manualCategories;
      
    if (!Array.isArray(sourceCategories)) {
      console.log('Categories is not an array:', sourceCategories);
      return [];
    }
    
    const mapped = sourceCategories.map(category => ({
      id: category._id,
      _id: category._id,
      name: category.name,
      description: category.description
    }));
    
    console.log('Source categories:', sourceCategories);
    console.log('Available categories for dropdown:', mapped);
    return mapped;
  }, [categories, manualCategories]);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Get file objects for API upload
      const attachments = fileList.map(file => file.originFileObj);
      
      // Prepare the complaint data
      const complaintData = {
        ...values,
        priority: values.priority || 'Medium'
      };
      
      // Log the data being submitted
      console.log('Submitting complaint data:', complaintData);
      console.log('Category value being sent:', complaintData.category);
      
      // Only add attachments if files were uploaded
      if (attachments.length > 0) {
        complaintData.attachments = attachments;
      }
        // Create new complaint
      const newComplaint = await addComplaint(complaintData);
      console.log('Complaint created successfully:', newComplaint);
      
      message.success('Complaint submitted successfully!');
      form.resetFields();
      setFileList([]);
      
      // Navigate to complaint history page instead of detail view
      navigate('/complaints');
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      message.error('Failed to submit complaint: ' + (error.message || 'An unexpected error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };
  
  const beforeUpload = (file) => {
    // Prevent automatic upload
    return false;
  };
  
  return (
    <div>
      <FormHeader>
        <Title level={2}>Submit New Complaint</Title>
        <Text type="secondary">
          Fill in the details below to submit a new complaint. We'll review it as soon as possible.
        </Text>
      </FormHeader>

      <StyledCard>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            priority: 'Medium'
          }}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[
              { required: true, message: 'Please enter the subject of your complaint' },
              { max: 100, message: 'Subject should not exceed 100 characters' }
            ]}
          >            <Input placeholder="Brief description of your complaint" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >            <Select placeholder="Select a category">
              {availableCategories.length > 0 ? (
                availableCategories.map(category => (
                  <Option key={category.id} value={category._id}>
                    {category.name}
                  </Option>
                ))
              ) : (
                <Option value="" disabled>No categories available</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please provide a detailed description' },
              { min: 30, message: 'Description should be at least 30 characters' }
            ]}
          >
            <TextArea 
              placeholder="Provide a detailed description of the issue..."
              rows={6}
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
          >
            <Select>
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Attachments"
            tooltip="You can upload images or documents to support your complaint"
          >
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              multiple
              maxCount={5}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Supported file types: JPG, PNG, PDF, DOC (Max: 5 files, 5MB each)
            </Text>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
              >
                Submit Complaint
              </Button>
              <Button 
                icon={<SaveOutlined />}
                onClick={() => message.info('Draft saved')}
              >
                Save as Draft
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </StyledCard>
    </div>
  );
};

export default NewComplaintPage;