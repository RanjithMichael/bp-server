import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getUsers,
} from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Current user routes
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

// Admin routes
router.route("/").get(protect, admin, getUsers); // Get all users
router.route("/:id").get(protect, admin, getUserById); // Get user by ID

export default router;

