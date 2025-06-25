import React, { createContext, useContext, useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { userService } from '../services/userService';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [complaintsData, categoriesData, statusesData, staffData] = await Promise.all([
          complaintService.getAllComplaints(),
          complaintService.getAllCategories(),
          complaintService.getAllStatuses(),
          userService.getAllStaff()
        ]);
        
        setComplaints(complaintsData);
        setCategories(categoriesData);
        setStatuses(statusesData);
        setStaffMembers(staffData);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Complaint CRUD operations
  const addComplaint = async (complaintData) => {
    const newComplaint = await complaintService.createComplaint(complaintData);
    setComplaints([...complaints, newComplaint]);
    return newComplaint;
  };

  const updateComplaint = async (id, complaintData) => {
    const updatedComplaint = await complaintService.updateComplaint(id, complaintData);
    setComplaints(complaints.map(c => c.id === id ? updatedComplaint : c));
    return updatedComplaint;
  };

  const deleteComplaint = async (id) => {
    await complaintService.deleteComplaint(id);
    setComplaints(complaints.filter(c => c.id !== id));
  };

  // Category CRUD operations
  const addCategory = async (categoryData) => {
    const newCategory = await complaintService.createCategory(categoryData);
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id, categoryData) => {
    const updatedCategory = await complaintService.updateCategory(id, categoryData);
    setCategories(categories.map(c => c.id === id ? updatedCategory : c));
    return updatedCategory;
  };

  const deleteCategory = async (id) => {
    await complaintService.deleteCategory(id);
    setCategories(categories.filter(c => c.id !== id));
  };

  // Staff CRUD operations
  const addStaffMember = async (staffData) => {
    const newStaff = await userService.createStaff(staffData);
    setStaffMembers([...staffMembers, newStaff]);
    return newStaff;
  };

  const updateStaffMember = async (id, staffData) => {
    const updatedStaff = await userService.updateStaff(id, staffData);
    setStaffMembers(staffMembers.map(s => s.id === id ? updatedStaff : s));
    return updatedStaff;
  };

  const deleteStaffMember = async (id) => {
    await userService.deleteStaff(id);
    setStaffMembers(staffMembers.filter(s => s.id !== id));
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
      deleteStaffMember
    }}>
      {children}
    </AppContext.Provider>
  );
};