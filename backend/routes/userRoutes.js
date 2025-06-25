import express from 'express';
import {
  getUsers,
  getUserById,
  getStaffUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers).post(protect, admin, createUser);
router.get('/employees', protect, admin, getStaffUsers);
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
