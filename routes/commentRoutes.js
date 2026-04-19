import express from "express";
import {
  addComment,
  getCommentsByPost,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

//DELETE FIRST
router.delete("/:commentId", protect, deleteComment);

//Then POST & GET
router
  .route("/:postId")
  .post(protect, addComment)
  .get(getCommentsByPost);

export default router;




