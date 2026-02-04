import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

/**
 * @desc    Add comment to a post
 * @route   POST /api/comments/:postId
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text, context } = req.body;
  const postId = req.params.postId;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment cannot be empty");
  }

  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) {
    res.status(404);
    throw new Error("Post not found or removed");
  }

  // ✅ Create comment in Comment collection
  const comment = await Comment.create({
    text: text.trim(),
    context,
    user: req.user._id, // fixed field name
    post: postId,
  });

  // ✅ Push reference into Post.comments array
  post.comments.push(comment._id);
  await post.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "name email profilePic"
  );

  res.status(201).json({
    success: true,
    data: populatedComment,
  });
});

/**
 * @desc    Get all comments for a post
 * @route   GET /api/comments/:postId
 * @access  Public
 */
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId, isDeleted: false })
    .populate("user", "name email profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: comments.length,
    data: comments,
  });
});

/**
 * @desc    Delete comment (soft delete)
 * @route   DELETE /api/comments/:id
 * @access  Private (author or admin)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (
    comment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  // ✅ Soft delete instead of permanent removal
  comment.isDeleted = true;
  await comment.save();

  res.json({ success: true, message: "Comment deleted (soft)" });
});