import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import slugify from "slugify";

// CREATE POST

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  // Generate unique slug
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
  res.status(201).json({ success: true, post: createdPost });
});

// GET ALL POSTS WITH SEARCH + PAGINATION/api/posts?page=1&limit=10&search=abc

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

  // Parallel (faster)
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
    success: true,
    posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

// GET POST BY ID + INCREMENT VIEWS

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email profilePic"
  );

  if (!post) return res.status(404).json({ message: "Post not found" });

  post.analytics.views += 1;
  await post.save();

  res.status(200).json({ success: true, post });
});

// GET POST BY SLUG + INCREMENT VIEWS

export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "author",
    "name email profilePic"
  );

  if (!post) return res.status(404).json({ message: "Post not found" });

  post.analytics.views += 1;
  await post.save();

  res.status(200).json({ success: true, post });
});

// GET POSTS BY AUTHOR

export const getPostsByAuthor = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id })
    .sort({ createdAt: -1 })
    .populate("author", "name email profilePic bio socialLinks")
    .lean();

  if (!posts.length) {
    return res.status(404).json({ message: "No posts found for this author" });
  }

  res.status(200).json({ success: true, posts });
});

// LIKE POST

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (post.analytics.likedBy.includes(req.user._id)) {
    return res.status(400).json({ message: "Already liked" });
  }

  post.analytics.likes += 1;
  post.analytics.likedBy.push(req.user._id);
  await post.save();

  res.status(200).json({
    success: true,
    message: "Liked",
    likes: post.analytics.likes,
  });
});

// UNLIKE POST

export const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (!post.analytics.likedBy.includes(req.user._id)) {
    return res.status(400).json({ message: "You haven't liked this post" });
  }

  post.analytics.likes -= 1;
  post.analytics.likedBy = post.analytics.likedBy.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await post.save();

  res.status(200).json({
    success: true,
    message: "Unliked",
    likes: post.analytics.likes,
  });
});

// SHARE POST

export const sharePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  if (post.analytics.sharedBy.includes(req.user._id)) {
    return res.status(400).json({ message: "Already shared" });
  }

  post.analytics.shares += 1;
  post.analytics.sharedBy.push(req.user._id);
  await post.save();

  const shareUrl = `${process.env.FRONTEND_URL}/post/${post.slug}`;

  res.status(200).json({
    success: true,
    message: "Shared successfully",
    shareUrl,
    shares: post.analytics.shares,
  });
});

// ADD COMMENT

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = {
    user: req.user._id,
    text,
    createdAt: new Date(),
  };

  post.analytics.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(req.params.id).populate(
    "analytics.comments.user",
    "name profilePic"
  );

  res.status(200).json({
    success: true,
    message: "Comment added",
    comments: updatedPost.analytics.comments,
  });
});

// GET POST ANALYTICS

export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("analytics.comments.user", "name profilePic")
    .lean();

  if (!post) return res.status(404).json({ message: "Post not found" });

  res.status(200).json({
    success: true,
    analytics: post.analytics,
  });
});
