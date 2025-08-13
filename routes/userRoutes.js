import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get logged-in user's profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update logged-in user's profile
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   GET /api/users/
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

export default router;

