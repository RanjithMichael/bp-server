import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public - Get all categories
router.get("/", getCategories);

// Public - Get single category by ID
router.get("/:id", getCategoryById);

// Admin only - Create a new category
router.post("/", protect, admin, createCategory);

// Admin only - Update a category
router.put("/:id", protect, admin, updateCategory);

// Admin only - Delete a category
router.delete("/:id", protect, admin, deleteCategory);

export default router;



