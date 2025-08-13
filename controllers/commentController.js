import Comment from "../models/Comment.js";

// @desc    Add comment
export const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      user: req.user._id,
      post: req.body.postId,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

