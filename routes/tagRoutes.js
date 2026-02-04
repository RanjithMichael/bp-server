import express from "express";
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: anyone can view tags
router.route("/")
  .get(getTags) 
  .post(protect, admin, createTag); // Admin only

// Admin: update or delete a tag by ID
router.route("/:id")
  .put(protect, admin, updateTag)     // PUT /api/tags/:id
  .delete(protect, admin, deleteTag); // DELETE /api/tags/:id

export default router;
