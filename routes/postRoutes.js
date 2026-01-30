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

// Helper: validation middleware

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  res.status(400).json({ success: false, errors: errors.array() });
};

// PUBLIC ROUTES

// Get all posts (supports ?search=keyword)
router.get("/", getAllPosts);

// Get post by slug
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/:id", getPostById);

// PRIVATE ROUTES (logged-in users)


// Create new post
router.post(
  "/",
  protect,
  validate([
    body("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("content").notEmpty().withMessage("Content is required"),
  ]),
  createPost
);

// Like / Unlike post
router.patch("/:id/like", protect, toggleLikePost);

// Add comment
router.post(
  "/:id/comments",
  protect,
  validate([body("text").notEmpty().withMessage("Comment cannot be empty")]),
  addComment
);

// Get post analytics (protected)
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;
