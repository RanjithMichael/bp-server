import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";

// @desc    Add comment
// @route   POST /api/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text, postId } = req.body;
  const comment = await Comment.create({
    text,
    user: req.user._id,
    post: postId,
  });
  res.status(201).json(comment);
});

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate("user", "name");
  res.json(comments);
});

export { addComment, getCommentsByPost };
