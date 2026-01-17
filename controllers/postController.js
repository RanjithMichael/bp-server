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

  const post = await Post.create({
    author: req.user?._id, // ✅ ensure author is set from authMiddleware
    title,
    content,
    category: category || "General",
    tags: Array.isArray(tags) ? tags : [],
    isDeleted: false,
    status: "published",
    analytics: {
      views: 0,
      likes: [],
      shares: 0,
    },
  });

  const populatedPost = await Post.findById(post._id).populate("author", "name profilePic");

  res.status(201).json({
    success: true,
    post: populatedPost,
  });
});

/**
 * @desc    Get all posts (paginated + search)
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || "";

  const filter = {
    isDeleted: false,
    status: "published",
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ],
    }),
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name profilePic"),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

/**
 * @desc    Get single post by ID (NO view increment)
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    .populate("author", "name email profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  res.json({
    success: true,
    post,
  });
});

/**
 * @desc    Get post by slug (increment views ONCE)
 * @route   GET /api/posts/slug/:slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, isDeleted: false })
    .populate("author", "name email profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  post.analytics ??= { views: 0, likes: [], shares: 0 };
  post.analytics.views += 1;

  await post.save();

  res.json({
    success: true,
    post,
  });
});

/**
 * @desc    Like / Unlike a post
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
export const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  post.analytics ??= { views: 0, likes: [], shares: 0 };
  post.analytics.likes ??= [];

  const userId = req.user._id.toString();
  const index = post.analytics.likes.findIndex((id) => id.toString() === userId);

  let liked = false;

  if (index >= 0) {
    post.analytics.likes.splice(index, 1);
  } else {
    post.analytics.likes.push(req.user._id);
    liked = true;
  }

  await post.save();

  res.json({
    success: true,
    liked,
    analytics: {
      likes: post.analytics.likes.length,
    },
  });
});

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment cannot be empty");
  }

  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  post.comments.push({
    user: req.user._id,
    text: text.trim(),
  });

  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("author", "name profilePic")
    .populate("comments.user", "name profilePic");

  res.status(201).json({
    success: true,
    post: updatedPost,
  });
});

/**
 * @desc    Get post analytics
 * @route   GET /api/posts/:id/analytics
 * @access  Private
 */
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  post.analytics ??= { views: 0, likes: [], shares: 0 };

  res.json({
    success: true,
    analytics: {
      views: post.analytics.views,
      likes: post.analytics.likes.length,
      shares: post.analytics.shares,
      comments: post.comments.length,
    },
  });
});

/**
 * @desc    Get posts created by a specific user
 * @route   GET /api/users/:id/posts
 * @access  Private (or Public if profile is visible)
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id, isDeleted: false })
    .populate("author", "name username profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    posts,
  });
});
