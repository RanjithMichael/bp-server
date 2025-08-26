import express from "express";
import { createPost, getPosts, getPostById, updatePost, deletePost } from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getPosts)
  .post(protect, createPost);

router.route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

export default router;


