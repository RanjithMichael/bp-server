import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  if (user) {
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
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account is deactivated. Contact admin.");
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
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
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
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const user = await User.findById(req.params.id);

  if (user) {
    // Soft delete instead of hard delete
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: "User deactivated successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {registerUser, loginUser, getUserProfile, deleteUser};