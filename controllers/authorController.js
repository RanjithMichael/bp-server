import asyncHandler from "express-async-handler";
import User from "../models/User.js"; // Assuming authors are users

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
export const getAllAuthors = asyncHandler(async (req, res) => {
  const authors = await User.find({ role: "author" }).select("-password");
  res.json(authors);
});

// @desc    Get author page by ID
// @route   GET /api/authors/:id
// @access  Public
export const getAuthorPage = asyncHandler(async (req, res) => {
  const author = await User.findById(req.params.id).select("-password");

  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  res.json(author);
});

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private/Admin or Author
export const updateAuthor = asyncHandler(async (req, res) => {
  const author = await User.findById(req.params.id);

  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  // Only allow updates to name, email, bio, etc.
  author.name = req.body.name || author.name;
  author.email = req.body.email || author.email;
  author.bio = req.body.bio || author.bio;

  const updatedAuthor = await author.save();
  res.json(updatedAuthor);
});

// @desc    Delete author
// @route   DELETE /api/authors/:id
// @access  Private/Admin
export const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await User.findById(req.params.id);

  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  await author.remove();
  res.json({ message: "Author removed" });
});

