import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getCategories)             // anyone can view categories
  .post(protect, admin, createCategory);

export default router;



