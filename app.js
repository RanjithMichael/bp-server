const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",   // CRA dev
      "http://localhost:5173",   // Vite dev
      "https://bp-client.netlify.app/" // your deployed frontend
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

module.exports = app;


