import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Subscription from "../models/Subscription.js";

// @desc    Get user by ID (with posts & subscriptions)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Fetch user's posts
  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

  // Fetch user's subscriptions
  const subscriptions = await Subscription.find({ user: user._id }).populate(
    "author",
    "name email"
  );

  res.json({ user, posts, subscriptions });
});

export default { getUserById };
