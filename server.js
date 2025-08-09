import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Simple root route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000", // your React frontend
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API is running on port ${PORT}`));





