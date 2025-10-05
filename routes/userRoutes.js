import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getUsers,
  getAuthorPage, // controller for public author pages
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public author page route (no login required)
router.get("/author/:id", getAuthorPage);

// Current logged-in user routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.route("/").get(protect, admin, getUsers); // Get all users
router.route("/:id").get(protect, admin, getUserById); // Get user by ID (admin only)

export default router;


