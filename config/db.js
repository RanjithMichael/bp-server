import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not defined in environment variables");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(`🔌 MongoDB connection closed due to ${signal}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during MongoDB shutdown", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("app termination (SIGINT)"));
process.on("SIGTERM", () => gracefulShutdown("app termination (SIGTERM)"));

// Connection events
mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

export default connectDB;