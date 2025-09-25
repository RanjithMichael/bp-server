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
    return res.status(400).json({ message: "Title and content are required" });
  }

  const post = new Post({
    author: req.user._id, // from protect middleware
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
 * @desc    Get all posts (with optional search)
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { title: { $regex: req.query.search, $options: "i" } },
          { content: { $regex: req.query.search, $options: "i" } },
          { category: { $regex: req.query.search, $options: "i" } },
          { tags: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const posts = await Post.find(keyword)
    .sort({ createdAt: -1 })
    .populate("author", "name email");

  res.json(posts);
});

/**
 * @desc    Get a post by ID (increments views)
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email"
  );

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.analytics.views = (post.analytics.views || 0) + 1;
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
    return res.status(404).json({ message: "Post not found" });
  }

  // check if user already liked
  if (
    post.analytics.likedBy.some(
      (id) => id.toString() === req.user._id.toString()
    )
  ) {
    return res.status(400).json({ message: "You already liked this post" });
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
    return res.status(404).json({ message: "Post not found" });
  }

  // check if user actually liked
  if (
    !post.analytics.likedBy.some(
      (id) => id.toString() === req.user._id.toString()
    )
  ) {
    return res.status(400).json({ message: "You have not liked this post" });
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
    return res.status(404).json({ message: "Post not found" });
  }

  if (
    post.analytics.sharedBy.some(
      (id) => id.toString() === req.user._id.toString()
    )
  ) {
    return res.status(400).json({ message: "You already shared this post" });
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
    return res.status(404).json({ message: "Post not found" });
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
    return res.status(404).json({ message: "Post not found" });
  }

  res.json(post.analytics);
});
