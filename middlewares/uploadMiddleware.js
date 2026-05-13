import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import cloudinaryStorage from "multer-storage-cloudinary";

const storage = cloudinaryStorage({
  cloudinary,
  folder: "blog_posts",
  allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;