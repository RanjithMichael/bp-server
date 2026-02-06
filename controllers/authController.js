import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // ✅ Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const normalizedEmail = email.toLowerCase();

  // ✅ Check existing user
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // ✅ Create user (password hashing handled in model)
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
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
    token: generateToken(user._id),
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const normalizedEmail = email.toLowerCase();

  // ✅ Explicitly select password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // ✅ Prevent bcrypt crash
  if (!user || !user.password) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // ✅ Check password safely
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // ✅ Check active status
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is deactivated. Contact admin.",
    });
  }

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
    token: generateToken(user._id),
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

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
    return res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // ✅ Soft delete
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: "User deactivated successfully",
  });
});

export { registerUser, loginUser, getUserProfile, deleteUser };
