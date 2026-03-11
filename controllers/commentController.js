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
  const { postId } = req.params;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found or removed" });
  }

  // Create comment in Comment collection
  const comment = await Comment.create({
    text: text.trim(),
    context,
    user: req.user._id,
    post: postId,
  });

  // Push reference into Post.comments array
  post.comments.push(comment._id);
  await post.save();

  // Populate user details for immediate frontend use
  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "_id name email profilePic"
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
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId, isDeleted: false })
    .populate("user", "_id name email profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: comments.length,
    data: comments,
  });
});

/**
 * @desc    Delete comment (soft delete + remove reference from Post)
 * @route   DELETE /api/comments/:postId/:commentId
 * @access  Private (author or admin)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  // Guard clause: make sure post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  // Find the comment
  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  // Authorization check
  if (
    comment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
  }

  // ✅ Safe removal of reference from Post.comments
  post.comments = post.comments.filter(
    (cId) => cId.toString() !== commentId.toString()
  );
  await post.save();

  // ✅ Soft delete the comment
  comment.isDeleted = true;
  await comment.save();

  res.json({ success: true, message: "Comment deleted successfully" });
});