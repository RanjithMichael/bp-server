import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, image, category, tags } = req.body;

  const post = new Post({
    title,
    content,
    image,
    category,
    tags,
    author: req.user._id, // from auth middleware
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "name email")
    .populate("category", "name")
    .populate("tags", "name");

  res.json(posts);
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name email")
    .populate("category", "name")
    .populate("tags", "name");

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (only author)
export const updatePost = asyncHandler(async (req, res) => {
  const { title, content, image, category, tags } = req.body;
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this post");
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image || post.image;
    post.category = category || post.category;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (only author)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this post");
    }

    await post.deleteOne();
    res.json({ message: "Post removed" });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});


