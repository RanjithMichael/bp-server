import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Subscription from "../models/Subscription.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";   // ✅ Brevo email utility

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const user = await User.create({ name, username, email, password });

  if (user) {
    // ✅ Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Blogging Platform 🎉",
        htmlContent: `
          <h2>Hello ${user.name},</h2>
          <p>Thanks for registering on our Blogging Platform!</p>
          <p>You can now log in and start creating posts.</p>
        `,
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid user data" });
  }
});

/**
 * @desc    Login user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ✅ explicitly select password
  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid email or password" });
  }
});

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      socialLinks: user.socialLinks,
      subscriptions: user.subscriptions,
    },
  });
});

/**
 * @desc    Get current logged-in user's posts
 * @route   GET /api/users/myposts
 * @access  Private
 */
export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user._id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .populate("author", "name username email profilePic");

  res.status(200).json({
    success: true,
    count: posts.length,
    posts,  
  });
});

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Update fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) user.password = req.body.password;
  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.socialLinks !== undefined) user.socialLinks = req.body.socialLinks;

  // Profile picture
  if (req.file) {
    user.profilePic = `/uploads/${req.file.filename}`;
  } else if (req.body.profilePic !== undefined) {
    user.profilePic = req.body.profilePic;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      socialLinks: updatedUser.socialLinks,
    },
  });
});

/**
 * @desc    Get user by ID (admin dashboard)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const posts = await Post.find({ author: user._id, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 });

  const subscriptions = await Subscription.find({ user: user._id })
    .populate("author", "name username email profilePic");

  res.json({
    success: true,
    user,
    posts,
    subscriptions,
  });
});

/**
 * @desc    Public Author Page (visible without login)
 * @route   GET /api/users/author/:username
 * @access  Public
 */
export const getAuthorPage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "Author not found" });
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

/**
 * @desc    Get all users (for admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");

  res.json({
    success: true,
    count: users.length,
    users, 
  });
});