import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getPosts);       // Get all posts
router.get("/:id", getPost);     // Get single post by id

// Private (only logged-in users)
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;