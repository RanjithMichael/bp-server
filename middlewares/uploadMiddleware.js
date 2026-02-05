import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads/images directory exists
const uploadDir = path.resolve("uploads/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpg|jpeg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Only image files (.jpg, .jpeg, .png, .gif, .webp) are allowed";
    cb(null, false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;