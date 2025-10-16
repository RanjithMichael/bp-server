import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Subscription from "../models/Subscription.js";

// @desc    Get current logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// @desc    Update current user's profile (name, email, bio, profilePic, social links)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

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

  // Profile picture (via multer upload)
  if (req.file) {
    user.profilePic = `/uploads/${req.file.filename}`;
  } else if (req.body.profilePic !== undefined) {
    // fallback for direct image URL update
    user.profilePic = req.body.profilePic;
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

// @desc    Get user by ID (for admin dashboard)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
  const subscriptions = await Subscription.find({ user: user._id }).populate(
    "author",
    "name email"
  );

  res.json({ user, posts, subscriptions });
});

// @desc    Public Author Page (visible without login)
// @route   GET /api/users/author/:id
// @access  Public
export const getAuthorPage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("Author not found");
  }

  const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

  res.json({
    author: {
      _id: user._id,
      name: user.name,
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



