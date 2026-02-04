import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  deleteUser,
} from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes
router.get("/profile", protect, getUserProfile);

// Admin routes
router.delete("/:id", protect, admin, deleteUser);

export default router;








