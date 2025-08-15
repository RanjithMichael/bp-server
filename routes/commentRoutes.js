import express from "express";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: view all comments for a post
router.get("/:postId", getCommentsByPost);

// Logged-in: add comment
router.post("/", protect, createComment);

// Logged-in (owner only): update/delete comment
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;




