import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Subscription from "../models/Subscription.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

//HELPER
const createTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
  };

  const accessToken = generateAccessToken(payload, "15m");
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

//REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const user = await User.create({ name, username, email, password });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid user data",
    });
  }

  // Send welcome email (non-blocking)
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

  const { accessToken, refreshToken } = createTokens(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    },
  });
});

//LOGIN 
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const { accessToken, refreshToken } = createTokens(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    },
  });
});

//GET USER POSTS 
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.params.id,
    isActive: true,
    status: { $ne: "removed" },
  })
    .populate("author", "_id name profilePic")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    posts,
  });
});

//PROFILE
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
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

//MY POSTS
export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user.id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .populate("author", "name username email profilePic");

  res.json({
    success: true,
    count: posts.length,
    posts,
  });
});

//UPDATE PROFILE 
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.socialLinks !== undefined) user.socialLinks = req.body.socialLinks;

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

//GET USER BY ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const posts = await Post.find({
    author: user._id,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  const subscriptions = await Subscription.find({ user: user._id })
    .populate("author", "name username email profilePic");

  res.json({
    success: true,
    user,
    posts,
    subscriptions,
  });
});

//AUTHOR PAGE
export const getAuthorPage = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Author not found",
    });
  }

  const posts = await Post.find({
    author: user._id,
    isDeleted: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .populate("author", "name username profilePic");

  res.json({
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

//GET ALL USERS
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");

  res.json({
    success: true,
    count: users.length,
    users,
  });
});