import express from "express";
import {
  addComment,
  getCommentsByPost,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for comments on a post
router.route("/:postId")
  .post(protect, addComment)   // POST /api/comments/:postId → add comment
  .get(getCommentsByPost);     // GET /api/comments/:postId → get comments

// Route for deleting a comment by ID
 router.route("/:postId/comments/:commentId")
  .delete(protect, deleteComment); // DELETE /api/comments/:postId/comments/:commentId → delete comment
export default router;





