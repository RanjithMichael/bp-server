import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  deleteUser,
  refreshAccessToken,
} from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Refresh token route (✅ changed to POST to match frontend)
router.post("/refresh", refreshAccessToken);

// Private routes
router.get("/profile", protect, getUserProfile);

// Admin routes
router.delete("/:id", protect, admin, deleteUser);

export default router;