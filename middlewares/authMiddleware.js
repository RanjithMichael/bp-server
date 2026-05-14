import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * @desc    Protect routes - verifies JWT and attaches user to req
 * @access  Private
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
      code: "NO_TOKEN",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with safe fields
    const user = await User.findById(decoded.id).select(
      "_id name email role profilePic bio socialLinks isActive"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Optional: allow demo users without isActive field
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Account deactivated",
        code: "ACCOUNT_DISABLED",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
      code: "TOKEN_INVALID",
    });
  }
});

/**
 * @desc    Admin middleware
 */
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({
    message: "Admin access required",
    code: "ADMIN_ONLY",
  });
};

/**
 * @desc    Author middleware
 */
export const author = (req, res, next) => {
  if (req.user && (req.user.role === "author" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({
    message: "Author access required",
    code: "AUTHOR_ONLY",
  });
};
