import express from "express";
import {
  getPostById,
  likePost,
  unlikePost,
  sharePost,
  getPostAnalytics,
  addComment,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Get post details (increments views)
router.route("/:id").get(getPostById);

// 📌 Likes (POST = like, DELETE = unlike)
router.route("/:id/like")
  .post(protect, likePost)      // like a post
  .delete(protect, unlikePost); // unlike a post

// 📌 Shares (POST = share once)
router.route("/:id/share").post(protect, sharePost);

// 📌 Comments
router.route("/:id/comment").post(protect, addComment);

// 📌 Analytics (views, likes, shares, comments count)
router.route("/:id/analytics").get(protect, getPostAnalytics);

export default router;
