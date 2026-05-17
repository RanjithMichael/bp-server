import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

// Map of category-specific default images
const defaultImages = {
 "data scientist": "https://res.cloudinary.com/djle175hb/image/upload/v1778841309/0_gMvS7ZBIoCX8-Mqe_emfljf.jpg",
  "business analyst": "https://res.cloudinary.com/djle175hb/image/upload/v1778841394/https_3A_2F_2Fwww.hbs.edu_2Fctfassets_2Fpublic_2Fimages_2F5zdIhFfQlGehyJLZCR11FB_2FBA_2520Image_sopvyb.webp",
  "computer coding": "https://res.cloudinary.com/djle175hb/image/upload/v1778841533/7200_myugxi.jpg",
  "machine learning": "https://res.cloudinary.com/djle175hb/image/upload/v1778841707/what-is-machine-learning-1024x683_vbjhb6.png",
  "artificial intelligence": "https://res.cloudinary.com/djle175hb/image/upload/v1778841815/where-is-ai-used_vbmbey.jpg",
  "html & css":"https://res.cloudinary.com/djle175hb/image/upload/v1778841882/1_lJ32Bl-lHWmNMUSiSq17gQ_erfbwd.png",
  "web development":"https://res.cloudinary.com/djle175hb/image/upload/v1778842008/1_V-Jp13LvtVc2IiY2fp4qYw_n6djkw.jpg",
  "mobile app development":"https://res.cloudinary.com/djle175hb/image/upload/v1778842101/7115055_1997_2_ldotl5.jpg",
  "cybersecurity":"https://res.cloudinary.com/djle175hb/image/upload/v1778842174/Cybersecurity_certiprof_t8uqpa.jpg",
  "generic": "https://res.cloudinary.com/djle175hb/image/upload/v1778771435/DALL_C2_B7E-2025-02-11-18.59.04-A-modern-and-professional-illustration-depicting-a-computer-programmer-working-on-code.-The-image-should-feature-a-clean-workspace-with-a-laptop-displ_vkl7n2.webp"
};

// helper to generate slug from title
const makeSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // spaces → hyphens
    .replace(/[^a-z0-9\-]/g, ""); // remove non-alphanumeric

export const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const categories = req.body["categories[]"] || req.body.categories || [];
  const tags = req.body["tags[]"] || req.body.tags || [];

  if (!title || title.trim().length < 5) {
    return res.status(400).json({ success: false, message: "Title must be at least 5 characters" });
  }

  if (!content || content.trim().length < 20) {
    return res.status(400).json({ success: false, message: "Content must be at least 20 characters" });
  }

  if (!req.user?._id) {
    return res.status(401).json({ success: false, message: "Unauthorized: Token invalid or missing" });
  }

  let coverImage;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogplatform_uploads",
      });
      coverImage = result.secure_url;
    } catch (err) {
      return res.status(500).json({ success: false, message: "Image upload failed", error: err.message });
    }
  } else {
    const primaryCategory = Array.isArray(categories) ? categories[0] : categories;
    coverImage =
      defaultImages[primaryCategory?.toLowerCase()] || defaultImages.generic;
  }

  const slug = makeSlug(title);

  const post = await Post.create({
    title,
    slug, // 🔑 unique slug stored in DB
    content,
    categories: Array.isArray(categories) ? categories : [categories],
    tags: Array.isArray(tags) ? tags : [tags],
    coverImage,
    author: req.user._id,
    status: "published",
    isActive: true,
    analytics: { views: 0, sharesCount: 0, commentsCount: 0, likesCount: 0 },
  });

  const populatedPost = await Post.findById(post._id).populate("author", "_id name username profilePic");

  res.status(201).json({ success: true, message: "Post created successfully", post: populatedPost });
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
        { categories: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id name username profilePic"),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      limit,
    },
  });
});

/** GET SINGLE POST BY ID */
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

  if (!post || !post.isActive || post.status === "removed") {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  const filteredPost = post.toObject();
  filteredPost.comments = filteredPost.comments.filter(c => !c.isDeleted);

  res.json({ success: true, post: filteredPost });
});

/** GET POST BY SLUG (increment views) */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug, isActive: true, status: "published" })
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

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
  post.likes = post.likes || [];

  const alreadyLiked = post.likes.some(id => id.toString() === userId);
  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  post.analytics = post.analytics || {};
  post.analytics.likesCount = post.likes.length;

  await post.save();

  res.status(200).json({
    success: true,
    likesCount: post.likes.length,
    liked: !alreadyLiked,
    postId: post._id,
  });
});

/** INCREMENT SHARE */
export const incrementSharePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  post.analytics.sharesCount = (post.analytics.sharesCount || 0) + 1;
  await post.save();

  res.json({ success: true, sharesCount: post.analytics.sharesCount });
});


/** ADD COMMENT */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  const post = await Post.findOne({ _id: req.params.id, status: "published", isActive: true });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  post.comments.push({ user: req.user._id, text: text.trim() });
  post.analytics = post.analytics || {};
  post.analytics.commentsCount = post.comments.filter(c => !c.isDeleted).length;
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

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
  post.analytics.commentsCount = post.comments.filter(c => !c.isDeleted).length;
  await post.save();

  const updatedPost = await Post.findById(postId)
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

  res.json({ success: true, message: "Comment deleted successfully", post: updatedPost });
});

/** GET POST ANALYTICS */
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const analytics = {
    views: post.analytics?.views || 0,
    likesCount: post.likes?.length || 0,
    sharesCount: post.analytics?.sharesCount || 0,
    commentsCount: post.comments?.filter(c => !c.isDeleted).length || 0,
  };

  res.json({ success: true, analytics });
});

/** GET USER POSTS */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.params.id,
    status: "published",
    isActive: true,
  })
    .populate("author", "_id name username profilePic")
    .sort({ createdAt: -1 });

  res.json({ success: true, posts });
});

/** UPDATE POST */
export const updatePost = asyncHandler(async (req, res) => {
  const { title, content, categories, tags, status } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to update this post" });
  }

  // ✅ Update fields
  post.title = title || post.title;
  post.content = content || post.content;
  post.categories = categories || post.categories;
  post.tags = tags || post.tags;
  post.status = status || post.status;

  // ✅ Handle image replacement if new file uploaded
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogplatform_uploads",
      });
      post.coverImage = result.secure_url;
    } catch (err) {
      return res.status(500).json({ success: false, message: "Image upload failed", error: err.message });
    }
  }

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate("author", "_id name username profilePic")
    .populate("comments.user", "_id name username profilePic");

  res.json({ success: true, message: "Post updated successfully", post: updatedPost });
});

/** DELETE POST (soft delete) */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted || post.status === "removed") {
    return res.status(404).json({ success: false, message: "Post not found or already removed" });
  }

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
  }

  post.isActive = false;
  post.status = "removed";
  await post.save();

  res.json({ success: true, message: "Post removed successfully" });
});
