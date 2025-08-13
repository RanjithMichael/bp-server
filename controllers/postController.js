import Post from "../models/Post.js";

// @desc    Create new post
export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all published posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).populate("author", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

