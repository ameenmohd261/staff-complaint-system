import React, { useState } from 'react';
import { 
  Table, Typography, Space, Button, Input, Card, 
  Modal, Form, Popconfirm, Badge, notification,
  Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined,
  ExclamationCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import { useApp } from '../../contexts/AppContext';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CategoriesPage = () => {
  const { 
    categories, 
    complaints,
    addCategory, 
    updateCategory, 
    deleteCategory,
    loading 
  } = useApp();
  
  // States for filtering
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(categories);
  
  // State for category modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add New Category');
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  // Apply filters
  React.useEffect(() => {
    let result = [...categories];
    
    if (searchText) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    setFilteredData(result);
  }, [categories, searchText]);
  
  // Get complaint count for each category
  const getCategoryCount = (categoryId) => {
    return complaints.filter(complaint => complaint.categoryId === categoryId).length;
  };
  
  // Open modal for adding new category
  const showAddModal = () => {
    setModalTitle('Add New Category');
    setModalMode('add');
    setCurrentCategory(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // Open modal for editing category
  const showEditModal = (category) => {
    setModalTitle('Edit Category');
    setModalMode('edit');
    setCurrentCategory(category);
    
    form.setFieldsValue({
      name: category.name,
      description: category.description
    });
    
    setModalVisible(true);
  };
  
  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (modalMode === 'add') {
        await addCategory(values);
        notification.success({
          message: 'Category Added',
          description: 'New category has been added successfully'
        });
      } else {
        await updateCategory(currentCategory.id, values);
        notification.success({
          message: 'Category Updated',
          description: 'Category has been updated successfully'
        });
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      notification.error({
        message: modalMode === 'add' ? 'Add Failed' : 'Update Failed',
        description: error.message || 'Failed to save category'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle category deletion
  const handleDelete = async (categoryId) => {
    const count = getCategoryCount(categoryId);
    
    if (count > 0) {
      notification.error({
        message: 'Cannot Delete Category',
        description: `This category has ${count} complaints. Please reassign them before deleting.`
      });
      return;
    }
    
    try {
      await deleteCategory(categoryId);
      notification.success({
        message: 'Category Deleted',
        description: 'Category has been deleted successfully'
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error.message || 'Failed to delete category'
      });
    }
  };
  
  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {getCategoryCount(record.id) > 0 && (
            <Badge count={getCategoryCount(record.id)} overflowCount={999} />
          )}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Complaints',
      key: 'complaints',
      render: (_, record) => {
        const count = getCategoryCount(record.id);
        return (
          <Tag color={count > 0 ? '#1890ff' : '#d9d9d9'}>
            {count} {count === 1 ? 'complaint' : 'complaints'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)} 
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={getCategoryCount(record.id) > 0}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={getCategoryCount(record.id) > 0}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Title level={2}>Category Management</Title>
      
      <StyledCard>
        <TableHeader>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Add Category
          </Button>
          
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </TableHeader>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} categories`,
          }}
          locale={{ emptyText: 'No categories found' }}
        />
      </StyledCard>
      
      {/* Add/Edit Category Modal */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitting}
            onClick={handleSubmit}
          >
            {modalMode === 'add' ? 'Add' : 'Save'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Category Name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea 
              placeholder="Category Description" 
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;