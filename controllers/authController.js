import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import sendResetEmail from "../utils/sendResetEmail.js";

//HELPER 
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

//TOKEN CREATOR
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
    role: "author",
  });

  const { accessToken, refreshToken } = createTokens(user);

  setRefreshCookie(res, refreshToken);

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

//LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is deactivated. Contact admin.",
    });
  }

  const { accessToken, refreshToken } = createTokens(user);

  setRefreshCookie(res, refreshToken);

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

//REFRESH 
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Invalid or inactive user",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = createTokens(user);

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (err) {
    console.error("Refresh error:", err.message);

    res.clearCookie("refreshToken");

    res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
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
    message: "Profile fetched successfully",
    user,
  });
});

//UPDATE PROFILE
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

//DELETE USER 
export const deleteUser = asyncHandler(async (req, res) => {
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

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: "User deactivated successfully",
  });
});

//FORGOT PASSWORD
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  await user.save();

  await sendResetEmail(user.email, resetToken);

  res.json({
    success: true,
    message: "Password reset email sent",
  });
});