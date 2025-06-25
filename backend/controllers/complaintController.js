import asyncHandler from 'express-async-handler';
import Complaint from '../models/complaintModel.js';
import Comment from '../models/commentModel.js';
import StatusHistory from '../models/statusHistoryModel.js';
import mongoose from 'mongoose';

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private/Admin
const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({})
    .populate('user', 'name email')
    .populate('category', 'name')
    .populate('assignedTo', 'name email')
    .sort('-createdAt');
  
  res.json(complaints);
});

// @desc    Get user's complaints
// @route   GET /api/complaints/user
// @access  Private
const getUserComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ user: req.user._id })
    .populate('category', 'name')
    .populate('assignedTo', 'name email')
    .sort('-createdAt');
  
  res.json(complaints);
});

// @desc    Get admin assigned complaints
// @route   GET /api/complaints/assigned
// @access  Private/Admin
const getAssignedComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ assignedTo: req.user._id })
    .populate('user', 'name email')
    .populate('category', 'name')
    .sort('-updatedAt');
  
  res.json(complaints);
});

// @desc    Get a complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('category', 'name description')
    .populate('assignedTo', 'name email department');

  if (complaint) {    // Check if the user is the owner or admin
    if (
      complaint.user._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin'
    ) {
      res.json(complaint);
    } else {
      res.status(403);
      throw new Error('Not authorized to access this complaint');
    }
  } else {
    res.status(404);
    throw new Error('Complaint not found');
  }
});

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
  console.log('Creating complaint, request body:', req.body);
  console.log('Uploaded files:', req.files);
  
  const { category, subject, description, priority } = req.body;
  
  console.log('Extracted data:', { 
    category, 
    subject, 
    description, 
    priority, 
    userID: req.user._id,
    filesCount: req.files?.length || 0
  });
  
  // Validate required fields
  if (!category || !subject || !description) {
    res.status(400);
    throw new Error('Please provide category, subject, and description');
  }
  
  // Validate category is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(category)) {
    console.error('Invalid category ID:', category);
    res.status(400);
    throw new Error('Please provide a valid category ID');
  }

  try {
    // Process uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalFilename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      category,
      subject,
      description,
      priority: priority || 'Medium',
      status: 'New',
      attachments,
    });

    if (complaint) {
      // Create status history
      await StatusHistory.create({
        complaint: complaint._id,
        status: 'New',
        updatedBy: req.user._id,
        note: 'Complaint created',
      });

      // Return created complaint
      const createdComplaint = await Complaint.findById(complaint._id)
        .populate('user', 'name email')
        .populate('category', 'name');

      console.log('Complaint created successfully:', createdComplaint);
      res.status(201).json(createdComplaint);
    } else {
      res.status(400);
      throw new Error('Invalid complaint data');
    }
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(400);
    throw new Error(`Failed to create complaint: ${error.message}`);
  }
});

// @desc    Update a complaint
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (complaint) {
    const oldStatus = complaint.status;
    const newStatus = req.body.status;

    // Update complaint fields
    complaint.category = req.body.category || complaint.category;
    complaint.subject = req.body.subject || complaint.subject;
    complaint.description = req.body.description || complaint.description;
    complaint.status = req.body.status || complaint.status;
    complaint.priority = req.body.priority || complaint.priority;
    complaint.assignedTo = req.body.assignedTo || complaint.assignedTo;

    // If satisfaction rating provided
    if (req.body.satisfaction) {
      complaint.satisfaction = req.body.satisfaction;
    }

    // Save the updated complaint
    const updatedComplaint = await complaint.save();

    // If status changed, create status history entry
    if (newStatus && oldStatus !== newStatus) {
      await StatusHistory.create({
        complaint: complaint._id,
        status: newStatus,
        updatedBy: req.user._id,
        note: req.body.statusNote || `Status changed from ${oldStatus} to ${newStatus}`,
      });
    }

    res.json(updatedComplaint);
  } else {
    res.status(404);
    throw new Error('Complaint not found');
  }
});

// @desc    Add attachment to complaint
// @route   POST /api/complaints/:id/attachments
// @access  Private
const addAttachment = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  // Check authorization
  if (
    complaint.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this complaint');
  }

  if (req.file) {
    const attachment = {
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    complaint.attachments.push(attachment);
    await complaint.save();

    res.status(201).json(attachment);
  } else {
    res.status(400);
    throw new Error('No file uploaded');
  }
});

// @desc    Get all comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Private
const getCommentsByComplaintId = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  // Check authorization
  if (
    complaint.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this complaint');
  }

  const comments = await Comment.find({ complaint: req.params.id })
    .populate('user', 'name role')
    .sort('createdAt');

  res.json(comments);
});

// @desc    Add a comment to a complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  // Check authorization
  if (
    complaint.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to comment on this complaint');
  }

  const { comment, attachments } = req.body;

  const newComment = await Comment.create({
    complaint: req.params.id,
    user: req.user._id,
    comment,
    attachments: attachments || [],
  });

  const populatedComment = await Comment.findById(newComment._id).populate(
    'user',
    'name role'
  );

  res.status(201).json(populatedComment);
});

// @desc    Get status history for a complaint
// @route   GET /api/complaints/:id/history
// @access  Private
const getStatusHistory = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  // Check authorization
  if (
    complaint.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this complaint history');
  }

  const history = await StatusHistory.find({ complaint: req.params.id })
    .populate('updatedBy', 'name role')
    .sort('createdAt');

  res.json(history);
});

export {
  getAllComplaints,
  getUserComplaints,
  getAssignedComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  addAttachment,
  getCommentsByComplaintId,
  addComment,
  getStatusHistory,
};
