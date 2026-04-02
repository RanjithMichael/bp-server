import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  refreshAccessToken,
  forgotPassword,
} from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);


// Forgot password route
router.post("/forgot-password", forgotPassword);


// Refresh token route (✅ changed to POST to match frontend)
router.post("/refresh", refreshAccessToken);

// Private routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin routes
router.delete("/:id", protect, admin, deleteUser);

export default router;