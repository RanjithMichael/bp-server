import express from "express";
import { getUserById } from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:id", protect, admin, getUserById);

export default router;