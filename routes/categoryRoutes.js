import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new category (admin only)
router.post('/', protect, admin, createCategory);

// Get all categories
router.get('/', getAllCategories);

// Get single category by ID
router.get('/:id', getCategoryById);

// Update category (admin only)
router.put('/:id', protect, admin, updateCategory);

// Delete category (admin only)
router.delete('/:id', protect, admin, deleteCategory);

export default router;

