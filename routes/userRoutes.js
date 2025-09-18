import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET current user's profile
router.route("/profile").get(protect, getUserProfile);

export default router;
