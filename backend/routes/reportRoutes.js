import express from 'express';
import {
  getDashboardStats,
  getUserDashboardStats,
  getReportByDateRange,
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/user-dashboard', protect, getUserDashboardStats);
router.post('/by-date', protect, admin, getReportByDateRange);

export default router;
