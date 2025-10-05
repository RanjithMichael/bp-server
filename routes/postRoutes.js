import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug, // import slug based controller
  likePost,
  unlikePost,
  sharePost,
  addComment,
  getPostAnalytics,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getAllPosts);
router.get("/slug/:slug", getPostBySlug); // route for slug
router.get("/:id", getPostById); // Existing ID-based route

// Private
router.post("/", protect, createPost);
router.post("/:id/like", protect, likePost);
router.delete("/:id/like", protect, unlikePost);
router.post("/:id/share", protect, sharePost);
router.post("/:id/comment", protect, addComment);
router.get("/:id/analytics", protect, getPostAnalytics);

export default router;
