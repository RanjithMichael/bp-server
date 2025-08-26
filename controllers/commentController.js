import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// @desc    Add comment to a post
// @route   POST /api/comments/:postId
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { text, context } = req.body; 
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = await Comment.create({
    text,       
    context,    
    author: req.user._id,
    post: postId,
  });

  res.status(201).json(comment);
});

// @desc    Get all comments for a post
// @route   GET /api/comments/:postId
// @access  Public
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId })
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  res.json(comments);
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (author or admin)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (
    comment.author.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await comment.deleteOne();
  res.json({ message: "Comment removed" });
});


