import asyncHandler from "express-async-handler";
import Tag from "../models/Tag.js";

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private/Admin
export const createTag = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    const tagExists = await Tag.findOne({ name });
    if (tagExists) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
export const getTags = asyncHandler(async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
