import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { users, categories } from './utils/seedData.js';
import User from './models/userModel.js';
import Category from './models/categoryModel.js';
import Complaint from './models/complaintModel.js';
import Comment from './models/commentModel.js';
import StatusHistory from './models/statusHistoryModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Complaint.deleteMany();
    await Comment.deleteMany();
    await StatusHistory.deleteMany();

    // Create users
    const createdUsers = await User.insertMany(users);    const adminUser = createdUsers[0]._id;
    const employeeUser1 = createdUsers[1]._id;
    const employeeUser2 = createdUsers[2]._id;

    // Create categories
    const createdCategories = await Category.insertMany(categories);

    // Create sample complaints
    const currentDate = new Date();
    
    const sampleComplaints = [      {
        user: employeeUser1,
        category: createdCategories[0]._id, // Technical Issue
        subject: 'Website is not loading properly',
        description: 'I am unable to access the website. It keeps showing error 500.',
        status: 'New',
        priority: 'High',
        createdAt: new Date(currentDate - 86400000 * 2), // 2 days ago
      },
      {
        user: employeeUser1,
        category: createdCategories[1]._id, // Billing Problem
        subject: 'Double charged for monthly subscription',
        description: 'I was charged twice for my monthly subscription this month.',        status: 'In Progress',
        priority: 'Medium',
        assignedTo: adminUser,
        createdAt: new Date(currentDate - 86400000 * 5), // 5 days ago
        updatedAt: new Date(currentDate - 86400000 * 3), // 3 days ago
      },
      {
        user: employeeUser2,
        category: createdCategories[4]._id, // Customer Service
        subject: 'Rude customer service representative',
        description: 'The support staff was very rude when I called about my issue.',
        status: 'Resolved',
        priority: 'Low',
        assignedTo: adminUser,
        createdAt: new Date(currentDate - 86400000 * 10), // 10 days ago
        updatedAt: new Date(currentDate - 86400000 * 8), // 8 days ago
        satisfaction: 4,
      },
    ];

    const createdComplaints = await Complaint.insertMany(sampleComplaints);

    // Create sample status history
    const sampleStatusHistory = [      {
        complaint: createdComplaints[0]._id,
        status: 'New',
        updatedBy: employeeUser1,
        note: 'Complaint created',
        createdAt: new Date(currentDate - 86400000 * 2), // 2 days ago
      },
      {
        complaint: createdComplaints[1]._id,
        status: 'New',
        updatedBy: employeeUser1,
        note: 'Complaint created',
        createdAt: new Date(currentDate - 86400000 * 5), // 5 days ago
      },
      {
        complaint: createdComplaints[1]._id,
        status: 'In Progress',
        updatedBy: adminUser,
        note: 'Investigating the issue',
        createdAt: new Date(currentDate - 86400000 * 3), // 3 days ago
      },
      {
        complaint: createdComplaints[2]._id,
        status: 'New',
        updatedBy: employeeUser2,
        note: 'Complaint created',
        createdAt: new Date(currentDate - 86400000 * 10), // 10 days ago
      },
      {
        complaint: createdComplaints[2]._id,
        status: 'In Progress',
        updatedBy: adminUser,
        note: 'Looking into this issue',
        createdAt: new Date(currentDate - 86400000 * 9), // 9 days ago
      },      {
        complaint: createdComplaints[2]._id,
        status: 'Resolved',
        updatedBy: adminUser,
        note: 'Issue has been addressed',
        createdAt: new Date(currentDate - 86400000 * 8), // 8 days ago
      },
    ];

    await StatusHistory.insertMany(sampleStatusHistory);

    // Create sample comments
    const sampleComments = [
      {
        complaint: createdComplaints[1]._id,
        user: adminUser,
        comment: 'We are looking into this issue and will get back to you soon.',
        createdAt: new Date(currentDate - 86400000 * 4), // 4 days ago
      },
      {
        complaint: createdComplaints[1]._id,
        user: employeeUser1,
        comment: 'Thank you. I appreciate your help.',
        createdAt: new Date(currentDate - 86400000 * 3.9), // 3.9 days ago
      },      {
        complaint: createdComplaints[2]._id,
        user: adminUser,
        comment: 'We apologize for the inconvenience. We have addressed this with the staff member.',
        createdAt: new Date(currentDate - 86400000 * 9), // 9 days ago
      },
      {
        complaint: createdComplaints[2]._id,
        user: employeeUser2,
        comment: 'Thank you for addressing this issue promptly.',
        createdAt: new Date(currentDate - 86400000 * 8.5), // 8.5 days ago
      },
    ];

    await Comment.insertMany(sampleComments);

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Clear all data
    await User.deleteMany();
    await Category.deleteMany();
    await Complaint.deleteMany();
    await Comment.deleteMany();
    await StatusHistory.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
