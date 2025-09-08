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

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Public
 */
router.get("/", getPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (authenticated users only)
 */
router.post("/", protect, createPost);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get("/:id", getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post by ID (author only)
 * @access  Private (authenticated users only)
 */
router.put("/:id", protect, updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post by ID (author only)
 * @access  Private (authenticated users only)
 */
router.delete("/:id", protect, deletePost);

export default router;



