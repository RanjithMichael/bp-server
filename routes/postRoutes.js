import express from "express";
import { body, validationResult } from "express-validator";

import {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  toggleLikePost,
  addComment,
  getPostAnalytics,
  getUserPosts,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

import { protect, author, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Helper: validation middleware
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ success: false, errors: errors.array() });
};

//  PUBLIC ROUTES 

// Get all posts (supports ?search=keyword)
router.get("/", getAllPosts);

// Get post by slug
router.get("/slug/:slug", getPostBySlug);

// Get posts by user
router.get("/user/:id", getUserPosts);

// Get post by ID
router.get("/:id", getPostById);

// PRIVATE ROUTES 

// Create new post (authors/admins only)
router.post(
  "/",
  protect,
  author,
  validate([
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("content").notEmpty().withMessage("Content is required"),
  ]),
  createPost
);

// Update post (authors/admins only)
router.put(
  "/:id",
  protect,
  author,
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

// Delete post (soft delete, authors/admins only)
router.delete("/:id", protect, author, deletePost);

// Like / Unlike post
router.post("/:id/like", protect, toggleLikePost);

// Add comment
router.post(
  "/:id/comments",
  protect,
  validate([body("text").notEmpty().withMessage("Comment cannot be empty")]),
  addComment
);

// Get post analytics
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;