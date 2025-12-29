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

//PUBLIC ROUTES 

// Get all posts (?search=keyword)
router.get("/", getAllPosts);

// Get post by slug (must come before /id)
router.get("/slug/:slug", getPostBySlug);

// Get post by ID
router.get("/id/:id", getPostById);

// Get analytics (public read)
router.get("/:id/analytics", getPostAnalytics);

//PRIVATE ROUTES 

// Create new post
router.post("/", protect, createPost);

// Like / Unlike (toggle)
router.put("/:id/like", protect, toggleLikePost);

// Add comment
router.post("/:id/comment", protect, addComment);

export default router;
