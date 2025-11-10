import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import slugify from "slugify";

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

  // Generate a unique slug (safe for duplicates)
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  const post = new Post({
    author: req.user._id,
    title,
    slug,
    content,
    category: category || "General",
    tags: tags || [],
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

/**
 * @desc    Get all posts (supports search + pagination)
 * @route   GET /api/posts
 * @access  Public
 * @query   ?page=1&limit=10&search=keyword
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Fetch posts and total count in parallel (faster)
  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name profilePic")
      .lean(),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

/**
 * @desc    Get a post by ID (increments views)
 * @route   GET /api/posts/id/:id
 * @access  Public
 */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email profilePic"
  );

  if (!post) return res.status(404).json({ message: "Post not found" });

  post.analytics.views = (post.analytics.views || 0) + 1;
  await post.save();

  res.status(200).json(post);
});

/**
 * @desc    Get a post by slug (used for share links)
 * @route   GET /api/posts/slug/:slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "author",
    "name email profilePic"
  );

  if (!post) return res.status(404).json({ message: "Post not found" });

  post.analytics.views = (post.analytics.views || 0) + 1;
  await post.save();

  res.status(200).json(post);
});

/**
 * @desc    Get all posts by a specific author
 * @route   GET /api/posts/author/:id
 * @access  Public
 */
export const getPostsByAuthor = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id })
    .sort({ createdAt: -1 })
    .populate("author", "name email profilePic bio socialLinks")
    .lean();

  if (!posts || posts.length === 0) {
    return res.status(404).json({ message: "No posts found for this author" });
  }

  res.status(200).json(posts);
});

/**
 * @desc    Like a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const alreadyLiked = post.analytics.likedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    return res.status(400).json({ message: "You already liked this post" });
  }

  post.analytics.likes += 1;
  post.analytics.likedBy.push(req.user._id);
  await post.save();

  res.status(200).json({ message: "Post liked", likes: post.analytics.likes });
});

/**
 * @desc    Unlike a post
 * @route   DELETE /api/posts/:id/like
 * @access  Private
 */
export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const hasLiked = post.analytics.likedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (!hasLiked) {
    return res.status(400).json({ message: "You haven’t liked this post" });
  }

  post.analytics.likes = Math.max(0, post.analytics.likes - 1);
  post.analytics.likedBy = post.analytics.likedBy.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await post.save();

  res.status(200).json({ message: "Post unliked", likes: post.analytics.likes });
});

/**
 * @desc    Share a post (increments shares)
 * @route   POST /api/posts/:id/share
 * @access  Private
 */
export const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const alreadyShared = post.analytics.sharedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyShared) {
    return res.status(400).json({ message: "You already shared this post" });
  }

  post.analytics.shares += 1;
  post.analytics.sharedBy.push(req.user._id);
  await post.save();

  const shareUrl = `${process.env.FRONTEND_URL}/post/${post.slug}`;

  res.status(200).json({
    message: "Post shared successfully",
    shares: post.analytics.shares,
    shareUrl,
  });
});

/**
 * @desc    Add a comment
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment text cannot be empty" });
  }

  const comment = {
    user: req.user._id,
    text,
    createdAt: Date.now(),
  };

  post.analytics.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(req.params.id).populate(
    "analytics.comments.user",
    "name profilePic"
  );

  res.status(200).json({
    message: "Comment added",
    comments: updatedPost.analytics.comments,
  });
});

/**
 * @desc    Get analytics (views, likes, shares, comments)
 * @route   GET /api/posts/:id/analytics
 * @access  Private
 */
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "analytics.comments.user",
    "name profilePic"
  );

  if (!post) return res.status(404).json({ message: "Post not found" });

  res.status(200).json(post.analytics);
});
