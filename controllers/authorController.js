import asyncHandler from "express-async-handler";
import User from "../models/User.js"; // Assuming authors are users

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
export const getAllAuthors = asyncHandler(async (req, res) => {
  const authors = await User.find({ role: "author" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: authors.length,
    data: authors,
  });
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

  res.json({
    success: true,
    data: author,
  });
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

  const { name, email, bio } = req.body;

  if (!name && !email && !bio) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  if (name) author.name = name;
  if (email) author.email = email;
  if (bio) author.bio = bio;

  const updatedAuthor = await author.save();

  res.json({
    success: true,
    data: updatedAuthor,
  });
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

  await author.deleteOne();

  res.json({
    success: true,
    message: "Author removed",
  });
});