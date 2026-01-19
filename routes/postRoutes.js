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
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES

// Get all posts (supports ?search=keyword)
router.get("/", getAllPosts);

// Get post by slug
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/:id", getPostById);

// PRIVATE ROUTES

// Create new post
router.post(
  "/",
  protect,
  [
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  (req, res, next) => {
    // Handle validation errors consistently
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  createPost
);

// Like / Unlike post (toggle)
router.patch("/:id/like", protect, toggleLikePost);

// Add comment
router.post(
  "/:id/comments",
  protect,
  [
    body("text").notEmpty().withMessage("Comment cannot be empty"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  addComment
);

// Get analytics (protected)
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;