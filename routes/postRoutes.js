import express from "express";
import {
  getAllPosts,
  getPostById,
  likePost,
  unlikePost,
  sharePost,
  getPostAnalytics,
  addComment,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all posts
router.route("/").get(getAllPosts);

// Get single post (increments views)
router.route("/:id").get(getPostById);

//  Likes
router.route("/:id/like")
  .post(protect, likePost)
  .delete(protect, unlikePost);

//  Shares
router.route("/:id/share").post(protect, sharePost);

//  Comments
router.route("/:id/comment").post(protect, addComment);

//  Analytics
router.route("/:id/analytics").get(protect, getPostAnalytics);

export default router;
