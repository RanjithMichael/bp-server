import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, admin, createCategory).get(getCategories);

export default router;



