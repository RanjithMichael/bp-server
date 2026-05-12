import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup: store files temporarily before Cloudinary upload
const upload = multer({ dest: "temp/" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload endpoint
router.post("/", protect, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "blogplatform_uploads",
      transformation: [{ width: 800, height: 600, crop: "limit" }], // optional resize
    });

    res.status(201).json({
      success: true,
      imageUrl: result.secure_url, // Cloudinary CDN URL
      publicId: result.public_id,  // useful if you want to delete/update later
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

