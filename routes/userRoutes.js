import express from "express";
import path from "path";
import multer from "multer";

import {
  getMyPosts,
  updateUserProfile,
  getUserById,
  getUsers,
  getAuthorPage,
  registerUser,
  loginUser,
  getUserProfile,   
} from "../controllers/userController.js";

import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

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

// ROUTES 

// Public routes
router.post("/register", registerUser); // POST /api/users/register
router.post("/login", loginUser);       // POST /api/users/login
router.get("/author/:username", getAuthorPage);

// Protected routes
router.get("/profile", protect, getUserProfile); 
router.get("/myposts", protect, getMyPosts);
router.put("/profile", protect, upload.single("profilePic"), updateUserProfile);

// Admin routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);

export default router;