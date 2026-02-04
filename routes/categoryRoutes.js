import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: anyone can view categories
router.route("/")
  .get(getCategories) 
  .post(protect, admin, createCategory); // Admin only

// Admin: update or delete a category by ID
router.route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);


export default router;




