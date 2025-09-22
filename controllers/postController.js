import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const post = new Post({
    author: req.user._id,   // from protect middleware
    title,
    content,
    category: category || "General",
    tags: tags || [],
    analytics: {
      views: 0,
      likes: 0,
      likedBy: [],
      shares: 0,
      sharedBy: [],
      comments: [],
    },
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 }) // latest first
    .populate("author", "name email"); // include author details

  res.json(posts);
});

/**
 * @desc    Get a post by ID (increments views)
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name email");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // increment views
  post.analytics.views += 1;
  await post.save();

  res.json(post);
});

/**
 * @desc    Like a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // check if user already liked
  if (post.analytics.likedBy.includes(req.user._id)) {
    res.status(400);
    throw new Error("You already liked this post");
  }

  post.analytics.likes += 1;
  post.analytics.likedBy.push(req.user._id);
  await post.save();

  res.json({ message: "Post liked", likes: post.analytics.likes });
});

/**
 * @desc    Unlike a post
 * @route   DELETE /api/posts/:id/like
 * @access  Private
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // check if user actually liked
  if (!post.analytics.likedBy.includes(req.user._id)) {
    res.status(400);
    throw new Error("You have not liked this post");
  }

  post.analytics.likes -= 1;
  post.analytics.likedBy = post.analytics.likedBy.filter(
    (id) => id.toString() !== req.user._id.toString()
  );
  await post.save();

  res.json({ message: "Post unliked", likes: post.analytics.likes });
});

/**
 * @desc    Share a post
 * @route   POST /api/posts/:id/share
 * @access  Private
 */
export const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.analytics.shares += 1;
  post.analytics.sharedBy.push(req.user._id);
  await post.save();

  res.json({ message: "Post shared", shares: post.analytics.shares });
});

/**
 * @desc    Add a comment
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = {
    user: req.user._id,
    text,
    createdAt: Date.now(),
  };

  post.analytics.comments.push(comment);
  await post.save();

  res.json({ message: "Comment added", comments: post.analytics.comments });
});

/**
 * @desc    Get analytics (views, likes, shares, comments)
 * @route   GET /api/posts/:id/analytics
 * @access  Private
 */
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "analytics.comments.user",
    "name"
  );

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json(post.analytics);
});
