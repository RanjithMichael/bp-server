import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags, image } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const post = await Post.create({
    title,
    content,
    category,
    tags,
    image,
    slug: slugify(title, { lower: true }),
    author: req.user._id, 
    status: "published",
  });

  res.status(201).json({
    success: true,
    post,
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
  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" } })
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
 * @desc    Get post by slug (increment views)
 * @route   GET /api/posts/slug/:slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    slug: req.params.slug,
    isDeleted: { $ne: true }, // ✅ prevent removed posts
    // status: "published",   // ❌ optional – avoid breaking older posts
  })
    .populate("author", "name username email profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  // ✅ Safe views increment
  post.views = (post.views || 0) + 1;
  await post.save();

  res.status(200).json({
    success: true,
    post,
  });
});

/**
 * @desc    Like / Unlike a post
 * @route   PATCH /api/posts/:id/like
 * @access  Private
 */
export const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" } });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  const userId = req.user._id.toString();
  const index = post.likes.findIndex((id) => id.toString() === userId);

  let liked = false;

  if (index >= 0) {
    post.likes.splice(index, 1);
  } else {
    post.likes.push(req.user._id);
    liked = true;
  }

  await post.save();

  res.json({
    success: true,
    liked,
    likesCount: post.likes.length,
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

  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" } });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  post.comments.push({
    user: req.user._id,
    text: text.trim(),
    post: post._id,
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
  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" } });

  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  res.json({
    success: true,
    analytics: {
      views: post.views,
      likes: post.likes.length,
      shares: post.shares,
      comments: post.comments.length,
    },
  });
});

/**
 * @desc    Get posts created by a specific user
 * @route   GET /api/users/:id/posts
 * @access  Public (or Private if restricted)
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id, status: { $ne: "removed" } })
    .populate("author", "name username profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    posts,
  });
});
