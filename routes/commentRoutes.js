import express from "express";
import {
  addComment,
  getCommentsByPost,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/:postId")
  .post(protect, addComment)   // add comment to post
  .get(getCommentsByPost);     // get comments for post

router.route("/delete/:id")
  .delete(protect, deleteComment); // delete comment

export default router;





