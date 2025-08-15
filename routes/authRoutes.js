import express from "express";
import { registerUser, loginUser, deleteUser  } from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin only: delete user + their comments
router.delete("/:id", protect, admin, deleteUser);

export default router;







