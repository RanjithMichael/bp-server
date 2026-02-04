import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const normalizedName = name.trim().toLowerCase();

  const categoryExists = await Category.findOne({ name: normalizedName });
  if (categoryExists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name: normalizedName });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  category.name = name.trim().toLowerCase();
  const updatedCategory = await category.save();

  res.json({
    success: true,
    data: updatedCategory,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

