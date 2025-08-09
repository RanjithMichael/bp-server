import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAllPosts).post(protect, createPost);
router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

export default router;
