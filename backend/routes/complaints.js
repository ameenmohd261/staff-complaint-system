const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).array('attachments', 5); // Max 5 files

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type!');
  }
}

// @route   POST api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      upload(req, res, async function(err) {
        if (err) {
          console.error(err);
          return res.status(400).json({ msg: err });
        }

        const user = await User.findById(req.user.id);
        let attachments = [];

        // Process file uploads if any
        if (req.files && req.files.length > 0) {
          attachments = req.files.map(file => ({
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype
          }));
        }

        const newComplaint = new Complaint({
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          priority: req.body.priority || 'medium',
          attachments: attachments,
          submittedBy: req.user.id,
          department: user.department
        });

        const complaint = await newComplaint.save();
        res.json(complaint);
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/complaints
// @desc    Get all complaints (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let complaints;
    
    // Staff see only their own complaints
    if (user.role === 'staff') {
      complaints = await Complaint.find({ submittedBy: req.user.id })
        .sort({ submittedDate: -1 })
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email');
    } 
    // Department heads see complaints from their department
    else if (user.role === 'department_head') {
      complaints = await Complaint.find({ department: user.department })
        .sort({ submittedDate: -1 })
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email');
    } 
    // Admins see all complaints
    else {
      complaints = await Complaint.find()
        .sort({ submittedDate: -1 })
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email');
    }

    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/complaints/:id
// @desc    Get complaint by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name email department')
      .populate('comments.user', 'name');
    
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    // Check if user has permission to see this complaint
    const user = await User.findById(req.user.id);
    
    if (
      user.role === 'staff' && 
      complaint.submittedBy._id.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'Not authorized to view this complaint' });
    }
    
    if (
      user.role === 'department_head' && 
      complaint.department !== user.department
    ) {
      return res.status(401).json({ msg: 'Not authorized to view this complaint' });
    }
    
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/complaints/:id
// @desc    Update complaint status (admin/dept head only)
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    // Check if department head has access to this complaint
    if (user.role === 'department_head' && complaint.department !== user.department) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update fields
    const { status, resolutionNotes, assignedTo, priority } = req.body;
    
    if (status) {
      complaint.status = status;
      
      // If resolving, add resolved date
      if (status === 'resolved') {
        complaint.resolvedDate = Date.now();
      }
    }
    
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }
    
    if (assignedTo) {
      complaint.assignedTo = assignedTo;
    }
    
    if (priority) {
      complaint.priority = priority;
    }

    await complaint.save();
    
    // Return updated complaint with populated fields
    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');
      
    res.json(updatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/complaints/:id
// @desc    Delete a complaint
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    // Check user permission (only creator can delete, and only if not resolved)
    if (
      complaint.submittedBy.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ msg: 'Not authorized to delete this complaint' });
    }
    
    // Only allow deletion if status is pending
    if (req.user.role !== 'admin' && complaint.status !== 'pending') {
      return res.status(400).json({ 
        msg: 'Cannot delete a complaint that is already in progress or resolved' 
      });
    }
    
    // Delete any attachment files
    if (complaint.attachments.length > 0) {
      complaint.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.fileUrl);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    await complaint.remove();
    res.json({ msg: 'Complaint removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Complaint not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST api/complaints/:id/comments
// @desc    Add a comment to a complaint
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    [check('text', 'Comment text is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ msg: 'Complaint not found' });
      }

      // Check if user has permission to comment on this complaint
      if (
        user.role === 'staff' && 
        complaint.submittedBy.toString() !== req.user.id &&
        complaint.assignedTo?.toString() !== req.user.id
      ) {
        return res.status(401).json({ msg: 'Not authorized to comment on this complaint' });
      }
      
      if (
        user.role === 'department_head' && 
        complaint.department !== user.department
      ) {
        return res.status(401).json({ msg: 'Not authorized to comment on this complaint' });
      }

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id
      };

      complaint.comments.unshift(newComment);

      await complaint.save();
      
      // Return updated complaint with populated comments
      const updatedComplaint = await Complaint.findById(req.params.id)
        .populate('comments.user', 'name');
        
      res.json(updatedComplaint.comments);
    } catch (err) {
      console.error(err.message);
      
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Complaint not found' });
      }
      
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;