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
    author: req.user._id,
    post: postId,
  });

  // ✅ Also push into Post.comments array for consistency
  post.comments.push({
    user: req.user._id,
    text: text.trim(),
  });
  await post.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name email profilePic"
  );

  res.status(201).json({
    success: true,
    comment: populatedComment,
  });
});

/**
 * @desc    Get all comments for a post
 * @route   GET /api/comments/:postId
 * @access  Public
 */
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId })
    .populate("author", "name email profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    comments,
  });
});

/**
 * @desc    Delete comment
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
    comment.author.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  // ✅ Remove from Comment collection
  await comment.deleteOne();

  // ✅ Also remove from Post.comments array
  await Post.updateOne(
    { _id: comment.post },
    { $pull: { comments: { _id: comment._id } } }
  );

  res.json({ success: true, message: "Comment removed" });
});