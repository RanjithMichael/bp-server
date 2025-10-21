import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  likePost,
  unlikePost,
  sharePost,
  addComment,
  getPostAnalytics,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =======================
      PUBLIC ROUTES
======================= */

// Get all posts (supports ?search= keyword)
router.get("/", getAllPosts);

// Get post by slug (must come BEFORE :id route)
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/id/:id", getPostById); // changed path to /id/:id to avoid conflict

/* =======================
      PRIVATE ROUTES
======================= */

// Create a new post
router.post("/", protect, createPost);

// Like / Unlike a post
router.post("/:id/like", protect, likePost);
router.delete("/:id/like", protect, unlikePost);

// Share a post (increments share count)
router.post("/:id/share", protect, sharePost);

// Add comment to a post
router.post("/:id/comment", protect, addComment);

// Get analytics (views, likes, shares, comments)
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;
