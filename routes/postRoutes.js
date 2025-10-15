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

// Get all posts
router.get("/", getAllPosts);

// Get post by slug
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/:id", getPostById);


/* =======================
      PRIVATE ROUTES
      (Require Authentication)
======================= */

// Create a new post
router.post("/", protect, createPost);

// Like and Unlike a post
router.post("/:id/like", protect, likePost);
router.delete("/:id/like", protect, unlikePost);

// Share a post
router.post("/:id/share", protect, sharePost);

// Add comment to a post
router.post("/:id/comment", protect, addComment);

// Get analytics for a post
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;
