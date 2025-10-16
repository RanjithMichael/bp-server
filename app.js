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

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://bloggingplatformclient.netlify.app",
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);

// Serve uploaded files (profile pictures, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- DEPLOYMENT SETUP --------------------
const __root = path.resolve();

// Serve frontend from client/dist
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__root, "/client/dist");
  app.use(express.static(clientBuildPath));

  // Ensure all non-API routes go to React index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Development mode test route
  app.get("/", (req, res) => {
    res.send("API is running 🚀");
  });
}
// -----------------------------------------------------------

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export app (used by server.js entry)
export default app;
