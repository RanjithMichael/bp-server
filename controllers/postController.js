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

  const populatedPost = await Post.findById(post._id)
    .populate("author", "_id name email profilePic");

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    post: populatedPost, //flattened
  });
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
    posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

/** GET SINGLE POST BY ID */
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  if (!post || !post.isActive || post.status === "removed") {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  //Filter out soft-deleted comments before sending
  const filteredPost = post.toObject();
  filteredPost.comments = filteredPost.comments.filter(c => !c.isDeleted);

  res.json({ success: true, post: filteredPost });
});

/** GET POST BY SLUG (increment views) */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({
    slug,
    isActive: true,
    status: "published",
  })
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  post.analytics = post.analytics || {};
  post.analytics.views = (post.analytics.views || 0) + 1;

  await post.save();

  const filteredPost = post.toObject();
  filteredPost.comments = filteredPost.comments.filter(c => !c.isDeleted);

  res.json({ success: true, post: filteredPost });
});

/** TOGGLE LIKE */
export const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || !post.isActive) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  const userId = req.user._id.toString();
  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }
  post.analytics = post.analytics || {};
  post.analytics.likesCount = post.likes.length;
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  res.json({ success: true, message: "Like toggled", post: updatedPost });
});

/** INCREMENT SHARE */
export const incrementSharePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || !post.isActive) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  post.shares = (post.shares || 0) + 1;
  post.analytics = post.analytics || {};
  post.analytics.sharesCount = (post.analytics.sharesCount || 0) + 1;
  await post.save();

  res.json({ success: true, message: "Post shared", post });
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
  post.analytics = post.analytics || {};
  post.analytics.commentsCount = post.comments.length;
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("author", "_id name profilePic")
    .populate("comments.user", "_id name profilePic");

  res.status(201).json({ success: true, message: "Comment added", post: updatedPost });
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

  res.json({ success: true, message: "Comment deleted successfully", post: updatedPost });
});

/** GET POST ANALYTICS */
export const getPostAnalytics = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // ✅ Always return analytics (even if empty)
  const analytics = post.analytics || {
    views: 0,
    likesCount: post.likes?.length || 0,
    sharesCount: post.shares || 0,
    commentsCount: post.comments?.length || 0,
  };

  res.json({
    success: true,
    analytics,
  });
};

/** GET USER POSTS */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id, status: { $ne: "removed" }, isActive: true })
    .populate("author", "_id name profilePic")
    .sort({ createdAt: -1 });

  res.json({ success: true, posts });
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

  res.json({ success: true, message: "Post updated successfully", post: updatedPost });
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