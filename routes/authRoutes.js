import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
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
router.post("/logout", logoutUser);


// Forgot password route
router.post("/forgot-password", forgotPassword);


// Refresh token route 
router.post("/refresh", refreshAccessToken);

// Private routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin routes
router.delete("/:id", protect, admin, deleteUser);

export default router;