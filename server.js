import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Warning: Missing environment variable ${key}`);
  }
});

const server = app.listen(PORT, () => {
  console.log(`✅ Blogging Platform Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGINT", () => {
  console.log("👋 Server shutting down gracefully...");
  server.close(() => process.exit(0));
});
