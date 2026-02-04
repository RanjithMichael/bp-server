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
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Public routes
router.get("/author/:username", getAuthorPage); // GET /api/users/author/:username

// Protected routes (logged-in users)
router.get("/myposts", protect, getMyPosts);

router
  .route("/profile")
  .put(protect, upload.single("profilePic"), updateUserProfile);

// Admin routes
router.route("/")
  .get(protect, admin, getUsers); // GET /api/users

router.route("/:id")
  .get(protect, admin, getUserById); // GET /api/users/:id
  // .put(protect, admin, updateUserById)   // optional future endpoint
  // .delete(protect, admin, deleteUserById) // optional future endpoint

export default router;