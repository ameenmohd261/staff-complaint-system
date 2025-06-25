import React, { createContext, useContext, useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { userService } from '../services/userService';
import { notification } from 'antd';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh all data from API
  const refreshData = async () => {
    setLoading(true);
    try {
      console.log('AppContext: Starting to refresh data...');
      
      // Try to fetch all data together first
      try {
        const [complaintsData, categoriesData, statusesData, staffData] = await Promise.all([
          complaintService.getAllComplaints(),
          complaintService.getAllCategories(),
          complaintService.getAllStatuses(),
          userService.getAllStaff()
        ]);
          console.log('AppContext - Categories data received:', categoriesData);
        console.log('AppContext - Categories count:', categoriesData?.length || 0);
        console.log('AppContext - Categories array check:', Array.isArray(categoriesData));
        console.log('AppContext - First category sample:', categoriesData?.[0]);
        
        setComplaints(complaintsData || []);
        setCategories(categoriesData || []);
        setStatuses(statusesData || []);
        setStaffMembers(staffData || []);
        
        console.log('AppContext: Data refresh completed successfully');
        console.log('AppContext: Categories state set to:', categoriesData);      } catch (parallelError) {
        console.warn('AppContext: Parallel fetch failed, trying individual fetches:', parallelError);
        
        // If parallel fetch fails, try fetching individually
        try {
          const categoriesData = await complaintService.getAllCategories();
          console.log('AppContext - Categories fetched individually:', categoriesData);
          console.log('AppContext - Individual fetch array check:', Array.isArray(categoriesData));
          setCategories(categoriesData || []);
          console.log('AppContext - Categories state set individually to:', categoriesData);
        } catch (catError) {
          console.error('AppContext: Failed to fetch categories:', catError);
          setCategories([]);
        }
        
        try {
          const statusesData = await complaintService.getAllStatuses();
          setStatuses(statusesData);
        } catch (statusError) {
          console.error('AppContext: Failed to fetch statuses:', statusError);
        }
        
        // Try other API calls that might require authentication
        try {
          const complaintsData = await complaintService.getAllComplaints();
          setComplaints(complaintsData);
        } catch (complaintError) {
          console.warn('AppContext: Failed to fetch complaints (may require auth):', complaintError);
          setComplaints([]); // Set empty array if unauthorized
        }
        
        try {
          const staffData = await userService.getAllStaff();
          setStaffMembers(staffData);
        } catch (staffError) {
          console.warn('AppContext: Failed to fetch staff (may require auth):', staffError);
          setStaffMembers([]); // Set empty array if unauthorized
        }
      }
    } catch (error) {
      console.error('AppContext: Complete failure to refresh data:', error);
      notification.error({
        message: 'Data Refresh Failed',
        description: 'Failed to load the latest data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    refreshData();
  }, []);
  
  // Complaint CRUD operations
  const addComplaint = async (complaintData) => {
    try {
      const newComplaint = await complaintService.createComplaint(complaintData);
      // Refresh complaints data to ensure we have the latest state
      const updatedComplaints = await complaintService.getAllComplaints();
      setComplaints(updatedComplaints);
      
      notification.success({
        message: 'Complaint Created',
        description: 'Your complaint has been submitted successfully.'
      });
      
      return newComplaint;
    } catch (error) {
      notification.error({
        message: 'Failed to Create Complaint',
        description: error.message || 'An error occurred while submitting your complaint.'
      });
      throw error;
    }
  };

  const updateComplaint = async (id, complaintData) => {
    try {
      const updatedComplaint = await complaintService.updateComplaint(id, complaintData);
        // Update local state with the updated complaint
      setComplaints(complaints.map(c => c._id === id ? updatedComplaint : c));
      
      notification.success({
        message: 'Complaint Updated',
        description: 'The complaint has been updated successfully.'
      });
      
      return updatedComplaint;
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description: error.message || 'Failed to update the complaint.'
      });
      throw error;
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await complaintService.deleteComplaint(id);
        // Update local state by removing the deleted complaint
      setComplaints(complaints.filter(c => c._id !== id));
      
      notification.success({
        message: 'Complaint Deleted',
        description: 'The complaint has been deleted successfully.'
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error.message || 'Failed to delete the complaint.'
      });
      throw error;
    }
  };

  // Category CRUD operations
  const addCategory = async (categoryData) => {
    try {
      const newCategory = await complaintService.createCategory(categoryData);
      
      // Update local state with the new category
      setCategories([...categories, newCategory]);
      
      notification.success({
        message: 'Category Created',
        description: 'The category has been created successfully.'
      });
      
      return newCategory;
    } catch (error) {
      notification.error({
        message: 'Failed to Create Category',
        description: error.message || 'An error occurred while creating the category.'
      });
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await complaintService.updateCategory(id, categoryData);
        // Update local state with the updated category
      setCategories(categories.map(c => c._id === id ? updatedCategory : c));
      
      notification.success({
        message: 'Category Updated',
        description: 'The category has been updated successfully.'
      });
      
      return updatedCategory;
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description: error.message || 'Failed to update the category.'
      });
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await complaintService.deleteCategory(id);
        // Update local state by removing the deleted category
      setCategories(categories.filter(c => c._id !== id));
      
      notification.success({
        message: 'Category Deleted',
        description: 'The category has been deleted successfully.'
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error.message || 'Failed to delete the category.'
      });
      throw error;
    }
  };

  // Staff CRUD operations
  const addStaffMember = async (staffData) => {
    try {
      const newStaff = await userService.createStaff(staffData);
      
      // Update local state with the new staff member
      setStaffMembers([...staffMembers, newStaff]);
      
      notification.success({
        message: 'Staff Member Added',
        description: 'The staff member has been added successfully.'
      });
      
      return newStaff;
    } catch (error) {
      notification.error({
        message: 'Failed to Add Staff',
        description: error.message || 'An error occurred while adding the staff member.'
      });
      throw error;
    }
  };

  const updateStaffMember = async (id, staffData) => {
    try {
      const updatedStaff = await userService.updateStaff(id, staffData);
        // Update local state with the updated staff member
      setStaffMembers(staffMembers.map(s => s._id === id ? updatedStaff : s));
      
      notification.success({
        message: 'Staff Member Updated',
        description: 'The staff member has been updated successfully.'
      });
      
      return updatedStaff;
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description: error.message || 'Failed to update the staff member.'
      });
      throw error;
    }
  };

  const deleteStaffMember = async (id) => {
    try {
      await userService.deleteStaff(id);
        // Update local state by removing the deleted staff member
      setStaffMembers(staffMembers.filter(s => s._id !== id));
      
      notification.success({
        message: 'Staff Member Deleted',
        description: 'The staff member has been deleted successfully.'
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error.message || 'Failed to delete the staff member.'
      });      throw error;
    }
  };
  
  return (
    <AppContext.Provider value={{
      complaints,
      categories,
      statuses,
      staffMembers,
      loading,
      addComplaint,
      updateComplaint,
      deleteComplaint,
      addCategory,
      updateCategory,
      deleteCategory,
      addStaffMember,
      updateStaffMember,
      deleteStaffMember,
      refreshData // Add refreshData function to context value
    }}>
      {children}
    </AppContext.Provider>
  );
};