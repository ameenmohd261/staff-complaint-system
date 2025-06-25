import express from 'express';
import {
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
} from '../controllers/complaintController.js';
import { protect, admin, anyUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get routes
router.get('/', protect, admin, getAllComplaints);
router.get('/user', protect, getUserComplaints);
router.get('/assigned', protect, admin, getAssignedComplaints);
router.get('/:id', protect, getComplaintById);
router.get('/:id/comments', protect, getCommentsByComplaintId);
router.get('/:id/history', protect, getStatusHistory);

// Post routes
router.post('/', upload.array('attachments', 5), createComplaint);
router.post('/:id/comments', addComment);
router.post('/:id/attachments', upload.single('attachment'), addAttachment);

// Put routes
router.put('/:id', protect, updateComplaint);

export default router;
