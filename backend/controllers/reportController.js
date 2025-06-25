import asyncHandler from 'express-async-handler';
import Complaint from '../models/complaintModel.js';
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Total complaints
  const totalComplaints = await Complaint.countDocuments({});
  
  // New complaints (status = 'New')
  const newComplaints = await Complaint.countDocuments({ status: 'New' });
  
  // In progress complaints
  const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
  
  // Resolved complaints
  const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
  
  // Closed complaints
  const closedComplaints = await Complaint.countDocuments({ status: 'Closed' });
  
  // User count
  const userCount = await User.countDocuments({ role: 'user' });
  
  // Staff count
  const staffCount = await User.countDocuments({ role: 'staff' });

  // Get complaints by category
  const categories = await Category.find({});
  const complaintsByCategory = await Promise.all(
    categories.map(async (category) => {
      const count = await Complaint.countDocuments({ category: category._id });
      return {
        categoryName: category.name,
        count,
      };
    })
  );

  // Get monthly complaint statistics for the past year
  const now = new Date();
  const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));

  const monthlyStats = await Complaint.aggregate([
    {
      $match: {
        createdAt: { $gte: lastYear },
      },
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'Resolved'] },
              1,
              0
            ]
          }
        }
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  res.json({
    totalComplaints,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    closedComplaints,
    userCount,
    staffCount,
    complaintsByCategory,
    monthlyStats,
  });
});

// @desc    Get user dashboard statistics
// @route   GET /api/reports/user-dashboard
// @access  Private
const getUserDashboardStats = asyncHandler(async (req, res) => {
  // User's total complaints
  const totalComplaints = await Complaint.countDocuments({ user: req.user._id });
  
  // New complaints
  const newComplaints = await Complaint.countDocuments({ 
    user: req.user._id,
    status: 'New'
  });
  
  // In progress complaints
  const inProgressComplaints = await Complaint.countDocuments({ 
    user: req.user._id,
    status: 'In Progress'
  });
  
  // Resolved complaints
  const resolvedComplaints = await Complaint.countDocuments({ 
    user: req.user._id,
    status: 'Resolved'
  });
  
  // Closed complaints
  const closedComplaints = await Complaint.countDocuments({ 
    user: req.user._id,
    status: 'Closed'
  });

  // Get recent complaints
  const recentComplaints = await Complaint.find({ user: req.user._id })
    .select('subject status priority createdAt category')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(5);

  // Get monthly complaint statistics for the past year
  const now = new Date();
  const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));

  const monthlyStats = await Complaint.aggregate([
    {
      $match: {
        createdAt: { $gte: lastYear },
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  res.json({
    totalComplaints,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    closedComplaints,
    recentComplaints,
    monthlyStats,
  });
});

// @desc    Generate report by date range
// @route   POST /api/reports/by-date
// @access  Private/Admin
const getReportByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end day

  const complaints = await Complaint.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate('user', 'name email')
    .populate('category', 'name')
    .populate('assignedTo', 'name')
    .sort('createdAt');

  // Calculate stats
  const totalComplaints = complaints.length;
  
  // Count by status
  const statusCounts = {
    New: 0,
    'In Progress': 0,
    'Pending Customer': 0,
    Resolved: 0,
    Closed: 0,
    Reopened: 0,
  };

  // Count by priority
  const priorityCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  // Count by category
  const categoryCounts = {};

  // Calculate average resolution time
  let totalResolutionTime = 0;
  let resolvedCount = 0;

  for (const complaint of complaints) {
    // Count by status
    if (statusCounts[complaint.status] !== undefined) {
      statusCounts[complaint.status]++;
    }

    // Count by priority
    if (priorityCounts[complaint.priority] !== undefined) {
      priorityCounts[complaint.priority]++;
    }

    // Count by category
    const categoryName = complaint.category ? complaint.category.name : 'Uncategorized';
    if (!categoryCounts[categoryName]) {
      categoryCounts[categoryName] = 0;
    }
    categoryCounts[categoryName]++;

    // Calculate resolution time for resolved/closed complaints
    if (['Resolved', 'Closed'].includes(complaint.status)) {
      const resolutionTime = new Date(complaint.updatedAt) - new Date(complaint.createdAt);
      totalResolutionTime += resolutionTime;
      resolvedCount++;
    }
  }

  // Calculate average resolution time in days
  const averageResolutionTime = resolvedCount > 0 
    ? (totalResolutionTime / resolvedCount) / (1000 * 60 * 60 * 24) 
    : 0;

  res.json({
    totalComplaints,
    statusCounts,
    priorityCounts,
    categoryCounts,
    averageResolutionTime,
    complaints,
  });
});

export { getDashboardStats, getUserDashboardStats, getReportByDateRange };
