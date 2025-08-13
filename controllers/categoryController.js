import Category from '../models/Category.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating category', error: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching categories', error: error.message });
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching category', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating category', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.remove();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting category', error: error.message });
  }
};