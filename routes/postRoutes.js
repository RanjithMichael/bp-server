import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";

import {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  toggleLikePost,
  addComment,
  deleteComment,
  getPostAnalytics,
  getUserPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

import { protect, author } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Helper: validation middleware for text fields
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    errors: errors.array(),
  });
};

// PUBLIC ROUTES
router.get("/", getAllPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/user/:id", getUserPosts);
router.get("/:id/analytics", getPostAnalytics);
router.get("/:id", getPostById);

// PRIVATE ROUTES

// ✅ Create new post (authors/admins only, with image upload)
router.post(
  "/",
  protect,
  author,
  upload.single("image"), // Multer handles file
  createPost
);

// Update post (authors/admins only)
router.put(
  "/:id",
  protect,
  author,
  upload.single("image"), // allow updating image too
  validate([
    body("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("content")
      .optional()
      .notEmpty()
      .withMessage("Content cannot be empty"),
  ]),
  updatePost
);

// Delete post (soft delete)
router.delete("/:id", protect, author, deletePost);

// Like / Unlike post
router.put("/:id/like", protect, toggleLikePost);

// Add comment
router.post(
  "/:id/comments",
  protect,
  validate([body("text").notEmpty().withMessage("Comment cannot be empty")]),
  addComment
);

// Delete comment
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;
