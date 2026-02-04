import express from "express";
import {
  getAuthorPage,
  getAllAuthors,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.route("/")
  .get(getAllAuthors); // GET /api/authors

router.route("/:id")
  .get(getAuthorPage); // GET /api/authors/:id

// Protected routes (Admin or Author)
router.route("/:id")
  .put(protect, updateAuthor)     // PUT /api/authors/:id
  .delete(protect, admin, deleteAuthor); // DELETE /api/authors/:id

export default router;