import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * @desc    Protect routes - verifies JWT and attaches user to req
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ Check for token in Authorization header OR cookies
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    // Verify token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (select only needed fields)
    const user = await User.findById(decoded.id).select("_id name email isAdmin profilePic");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      res.status(401);
      throw new Error("Token expired, please log in again");
    } else {
      res.status(401);
      throw new Error("Not authorized, token invalid");
    }
  }
});

/**
 * @desc    Admin middleware
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403); // ✅ Forbidden instead of Unauthorized
    throw new Error("Not authorized as admin");
  }
};