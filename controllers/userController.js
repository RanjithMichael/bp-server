import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Subscription from "../models/Subscription.js";

// @desc    Get current logged-in user's posts
// @route   GET /api/users/myposts
// @access  Private
export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user._id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .populate("author", "name username email profilePic");

  res.status(200).json({
    success: true,
    posts,
  });
});

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update basic info
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  // Password (optional)
  if (req.body.password) {
    user.password = req.body.password; 
  }

  // Bio and social links
  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.socialLinks !== undefined) user.socialLinks = req.body.socialLinks;

  // Profile picture (Multer upload)
  if (req.file) {
    user.profilePic = `/uploads/${req.file.filename}`;
  } else if (req.body.profilePic !== undefined) {
    user.profilePic = req.body.profilePic; // fallback URL
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    bio: updatedUser.bio,
    profilePic: updatedUser.profilePic,
    socialLinks: updatedUser.socialLinks,
  });
});

// @desc    Get user by ID (admin dashboard)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const posts = await Post.find({ author: user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  const subscriptions = await Subscription.find({ user: user._id }).populate(
    "author",
    "name username email profilePic"
  );

  res.json({ user, posts, subscriptions });
});

// @desc    Public Author Page (visible without login)
// @route   GET /api/users/author/:username
// @access  Public
export const getAuthorPage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Author not found");
  }

  const posts = await Post.find({
    author: user._id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .populate("author", "name username profilePic");

  res.status(200).json({
    success: true,
    author: {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      socialLinks: user.socialLinks,
    },
    posts,
  });
});

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});
