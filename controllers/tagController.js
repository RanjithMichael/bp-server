import asyncHandler from "express-async-handler";
import Tag from "../models/Tag.js";

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private/Admin
export const createTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Tag name is required" });
  }

  const normalizedName = name.trim().toLowerCase();

  const tagExists = await Tag.findOne({ name: normalizedName });
  if (tagExists) {
    return res.status(400).json({ message: "Tag already exists" });
  }

  const tag = await Tag.create({ name: normalizedName });

  res.status(201).json({
    success: true,
    data: tag,
  });
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({}).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: tags.length,
    data: tags,
  });
});

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
export const updateTag = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Tag name is required" });
  }

  tag.name = name.trim().toLowerCase();
  const updatedTag = await tag.save();

  res.json({
    success: true,
    data: updatedTag,
  });
});

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    res.status(404);
    throw new Error("Tag not found");
  }

  await tag.deleteOne();

  res.json({
    success: true,
    message: "Tag deleted successfully",
  });
});
