import express from "express";
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

// Get all posts (?search=keyword)
router.get("/", getAllPosts);

// Get post by slug
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/:id", getPostById);

// PRIVATE ROUTES 

// Create new post
router.post("/", protect, createPost);

// Like / Unlike post
router.put("/:id/like", protect, toggleLikePost);

// Add comment
router.post("/:id/comments", protect, addComment);

// Get analytics (protected)
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;
