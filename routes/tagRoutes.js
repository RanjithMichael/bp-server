import express from "express";
import { createTag, getTags } from "../controllers/tagController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getTags)                // anyone can view tags
  .post(protect, admin, createTag); // only admin can create tags

export default router;
