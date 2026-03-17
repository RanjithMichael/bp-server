import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

/** CREATE POST */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, categories, tags, coverImage } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content are required" });
  }
  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
  }

  const post = await Post.create({
    title,
    content,
    categories: categories || [],
    tags: tags || [],
    coverImage: coverImage || "",
    author: req.user._id,
    status: "published",
    isActive: true,
  });

  const populatedPost = await Post.findById(post._id).populate("author", "_id name email profilePic");
  res.status(201).json({ success: true, message: "Post created successfully", data: populatedPost });
});

/** GET ALL POSTS (paginated + search) */
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim() || "";

  const filter = {
    status: "published",
    isActive: true,
    ...(search && {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id name profilePic"),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

/** GET SINGLE POST BY ID */
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" }, isActive: true })
    .populate("author", "_id name email profilePic")
    .populate("comments.user", "_id name profilePic");

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  res.json({ success: true, data: post });
});

/** GET POST BY SLUG (increment views) */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const post = await Post.findOne({ slug })
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.views = (post.views || 0) + 1;
  await post.save();

  res.json({ success: true, data: post });
});

/** TOGGLE LIKE */
export const toggleLikePost = asyncHandler(async (req, res) => {
  const updatedPost = await Post.toggleLike(req.params.id, req.user._id);
  if (!updatedPost) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }
  res.json({ success: true, message: "Like toggled", data: updatedPost });
});

/** INCREMENT SHARE */
export const incrementSharePost = asyncHandler(async (req, res) => {
  const updatedPost = await Post.incrementShare(req.params.id);
  if (!updatedPost) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }
  res.json({ success: true, message: "Post shared", data: updatedPost });
});

/** ADD COMMENT */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" }, isActive: true });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  post.comments.push({ user: req.user._id, text: text.trim() });
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  res.status(201).json({ success: true, message: "Comment added", data: updatedPost });
});

/** DELETE COMMENT */
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);
  if (!post || !post.isActive) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
  }

  comment.remove();
  await post.save();

  const updatedPost = await Post.findById(postId)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  res.json({ success: true, message: "Comment deleted successfully", data: updatedPost });
});

/** GET POST ANALYTICS */
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: { $ne: "removed" }, isActive: true });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  res.json({
    success: true,
    data: {
      views: post.views || 0,
      likes: post.likes?.length || 0,
      shares: post.shares || 0,
      comments: post.comments?.filter((c) => !c.isDeleted).length || 0,
    },
  });
});

/** GET USER POSTS */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id, status: { $ne: "removed" }, isActive: true })
    .populate("author", "_id name profilePic")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: posts });
});

/** UPDATE POST */
export const updatePost = asyncHandler(async (req, res) => {
  const { title, content, categories, tags, coverImage, status } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to update this post" });
  }

  post.title = title || post.title;
  post.content = content || post.content;
  post.categories = categories || post.categories;
  post.tags = tags || post.tags;
  post.coverImage = coverImage || post.coverImage;
  post.status = status || post.status;

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  res.json({ success: true, message: "Post updated successfully", data: updatedPost });
});

/**
 * @desc    Delete a post (soft delete)
 * @route   DELETE /api/posts/:id
 * @access  Private/Author/Admin
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive) {
    return res
      .status(404)
      .json({ success: false, message: "Post not found or already removed" });
  }

  // Only author or admin can delete
  if (
    post.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to delete this post" });
  }

  // Soft delete
  post.isActive = false;
  post.status = "removed";
  await post.save();

  res.json({ success: true, message: "Post removed successfully" });
});
