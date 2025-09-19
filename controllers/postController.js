import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

//  Get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // latest first
      .populate("author", "name email"); // include author details

    res.json(posts);
  } catch (error) {
    res.status(500);
    throw new Error("Server error fetching posts");
  }
});

//  Get post by ID (increments views)
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

//  Like a post
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

//  Unlike a post
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

//  Share a post
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

//  Add a comment
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

//  Get analytics (views, likes, shares, comments)
export const getPostAnalytics = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("analytics.comments.user", "name");

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json(post.analytics);
});

