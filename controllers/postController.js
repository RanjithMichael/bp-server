import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

//CREATE POST
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const post = await Post.create({
    author: req.user._id,
    title,
    content,
    category: category || "General",
    tags: tags || [],
  });

  res.status(201).json({
    success: true,
    post,
  });
});

//GET ALL POSTS 
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

  const [posts, totalPosts] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name profilePic")
      .lean(),
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

//GET POST BY ID  
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name email profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.analytics.views += 1;
  await post.save();

  res.json({ success: true, post });
});

//GET POST BY SLUG 
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate("author", "name email profilePic")
    .populate("comments.user", "name profilePic");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.analytics.views += 1;
  await post.save();

  res.json({ success: true, post });
});

//LIKE & UNLIKE (TOGGLE)
export const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userId = req.user._id.toString();
  const alreadyLiked = post.analytics.likes
    .map((id) => id.toString())
    .includes(userId);

  if (alreadyLiked) {
    post.analytics.likes = post.analytics.likes.filter(
      (id) => id.toString() !== userId
    );
  } else {
    post.analytics.likes.push(userId);
  }

  await post.save();

  res.json({
    success: true,
    liked: !alreadyLiked,
    likesCount: post.analytics.likes.length,
  });
});

//ADD COMMENT 
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment cannot be empty");
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.comments.push({
    user: req.user._id,
    text,
  });

  await post.save();

  const updatedPost = await Post.findById(req.params.id).populate(
    "comments.user",
    "name profilePic"
  );

  res.status(201).json({
    success: true,
    comments: updatedPost.comments,
  });
});

//GET ANALYTICS 
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).lean();

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

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
