import express from "express";
import { addComment, getCommentsByPost } from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addComment);
router.get("/:postId", getCommentsByPost);

export default router;




