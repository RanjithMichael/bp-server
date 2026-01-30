import express from "express";
import {
  getAuthorPage,
  getAllAuthors,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authorController.js";

const router = express.Router();

// Get all authors
// GET /api/authors
router.get("/", getAllAuthors);

// Get single author page
// GET /api/authors/:id
router.get("/:id", getAuthorPage);

// Update author
// PUT /api/authors/:id
router.put("/:id", updateAuthor);

// Delete author
// DELETE /api/authors/:id
router.delete("/:id", deleteAuthor);

export default router;

