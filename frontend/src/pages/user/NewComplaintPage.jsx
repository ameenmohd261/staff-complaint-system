import React, { useState } from 'react';
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
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Convert fileList to attachments array
      const attachments = fileList.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file.originFileObj),
        type: file.type
      }));
      
      // Create new complaint
      const newComplaint = await addComplaint({
        ...values,
        attachments,
        priority: values.priority || 'Medium'
      });
      
      message.success('Complaint submitted successfully!');
      form.resetFields();
      setFileList([]);
      
      // Navigate to the detail view of the new complaint
      navigate(`/complaints/${newComplaint.id}`);
    } catch (error) {
      message.error('Failed to submit complaint: ' + error.message);
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
          >
            <Input placeholder="Brief description of your complaint" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a category">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
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