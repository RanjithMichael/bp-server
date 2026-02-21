import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const normalizedEmail = email.toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
  });

  const accessToken = generateAccessToken(user._id, { email: user.email });
  const refreshToken = generateRefreshToken(user._id, { email: user.email });

  // Store refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    accessToken,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });
  }

  const accessToken = generateAccessToken(user._id, { email: user.email });
  const refreshToken = generateRefreshToken(user._id, { email: user.email });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    accessToken,
  });
});

/**
 * @desc    Refresh access token using refresh token cookie
 * @route   GET /api/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: "Invalid or inactive user" });
    }

    const accessToken = generateAccessToken(user._id, { email: user.email });
    const newRefreshToken = generateRefreshToken(user._id, { email: user.email });

    // Rotate refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      profilePic: user.profilePic,
      socialLinks: user.socialLinks,
      isActive: user.isActive,
    },
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/auth/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized as admin" });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.isActive = false; // soft delete
  await user.save();

  res.json({ success: true, message: "User deactivated successfully" });
});

export { registerUser, loginUser, refreshAccessToken, getUserProfile, deleteUser };
