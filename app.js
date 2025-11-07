import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Load env and connect DB
dotenv.config();
connectDB();

const app = express();

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://bloggingplatformclient.netlify.app", // your Netlify frontend
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Static uploads (for images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);

// Slug route (for shared post links)
import Post from "./models/Post.js";
app.get("/api/posts/slug/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("author", "username name _id")
      .populate("categories tags", "name slug");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error("Slug fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Root route (for Render health check)
app.get("/", (req, res) => {
  res.send("Blogging Platform Backend is running!");
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
