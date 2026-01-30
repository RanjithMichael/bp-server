import express from "express";
import path from "path";
import multer from "multer";

import {
  getMyPosts,
  updateUserProfile,
  getUserById,
  getUsers,
  getAuthorPage,
} from "../controllers/userController.js";

import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for profile pictures

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Public route

router.get("/author/:username", getAuthorPage); // public author page by username

// Protected routes (logged-in users)

router.get("/myposts", protect, getMyPosts);

router
  .route("/profile")
  .put(protect, upload.single("profilePic"), updateUserProfile);

// Admin routes

router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);

export default router;

