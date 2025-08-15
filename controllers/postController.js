import Post from "../models/post.js";

// Create a new post
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      category,
      tags,
      author: req.user.id, // assuming auth middleware sets req.user
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    next(error);
  }
};

// Get all posts
export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("author", "name email");
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Get single post by ID
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Update post
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    next(error);
  }
};

// Delete post
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};
