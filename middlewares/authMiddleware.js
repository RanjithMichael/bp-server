import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * @desc    Protect routes - verifies JWT and attaches user to req
 * @access  Private
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header OR cookies
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (only safe fields)
    const user = await User.findById(decoded.id).select(
      "_id name email role profilePic bio socialLinks isActive"
    );

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }

    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
});

/**
 * @desc    Admin middleware
 * @access  Private/Admin
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
};

/**
 * @desc    Author middleware
 * @access  Private/Author
 */
export const author = (req, res, next) => {
  if (req.user && (req.user.role === "author" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as author" });
  }
};