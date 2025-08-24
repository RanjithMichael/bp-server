import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;
  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    category,
  });
  res.status(201).json(post);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("author", "name").populate("category", "name");
  res.json(posts);
});

export { createPost, getPosts };
