import express from "express";
import path from "path";
import multer from "multer";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Upload endpoint
router.post("/", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  res.status(201).json({
    success: true,
    imageUrl: `/uploads/${req.file.filename}`,
  });
});

// Error handling middleware for Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

export default router;