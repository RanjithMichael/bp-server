import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  deleteUser,
} from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Refresh token route
router.post("/refresh", (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Issue new access token
      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Private routes
router.get("/profile", protect, getUserProfile);

// Admin routes
router.delete("/:id", protect, admin, deleteUser);

export default router;








