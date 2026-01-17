import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  getUsers,
  getAuthorPage, // public author page controller
} from "../controllers/userController.js";
import { getUserPosts } from "../controllers/postController.js"; // ✅ import new controller
import { protect, admin } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup for profile pictures 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Public Author Page (no login required)
router.get("/author/:id", getAuthorPage);

// ✅ New route: Get posts created by a specific user
router.get("/:id/posts", protect, getUserPosts);

// Current logged-in user routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("profilePic"), updateUserProfile);

// Admin routes
router.route("/").get(protect, admin, getUsers);
router.route("/:id").get(protect, admin, getUserById);

export default router;