import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import User from "./models/User.js";

dotenv.config();

// Map of category-specific default images
const defaultImages = {
  datascientist: "https://res.cloudinary.com/<cloud>/image/upload/v123/datascientist.jpg",
  analyst: "https://res.cloudinary.com/<cloud>/image/upload/v123/analyst.jpg",
  computer: "https://res.cloudinary.com/<cloud>/image/upload/v123/ml.jpg",
  developer: "https://res.cloudinary.com/<cloud>/image/upload/v123/developer.jpg",
  cloud: "https://res.cloudinary.com/<cloud>/image/upload/v123/cloud.jpg",
  generic: "https://res.cloudinary.com/<cloud>/image/upload/v123/default.jpg",
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const seedPosts = async () => {
  try {
    // Clear old posts
    await Post.deleteMany({});
    console.log("🧹 Old posts cleared");

    // Fetch demo authors
    const ranjith = await User.findOne({ email: "ranjith@example.com" });
    const demo = await User.findOne({ email: "demo@example.com" });
    const reviewer = await User.findOne({ email: "reviewer@example.com" });

    if (!ranjith || !demo || !reviewer) {
      throw new Error("One or more demo users not found");
    }

    const postsData = [
      {
        title: "Data scientist",
        content: "A data scientist is a professional who analyzes complex datasets using statistics, machine learning, and programming...",
        categories: ["datascientist"],
        tags: ["datascientist"],
        author: demo._id,
      },
      {
        title: "Business Analyst",
        content: "A Business Analyst (BA) acts as a bridge between business stakeholders and IT teams, analyzing data and processes...",
        categories: ["analyst"],
        tags: ["analyst"],
        author: ranjith._id,
      },
      {
        title: "Machine learning",
        content: "Machine learning (ML) is a subset of artificial intelligence (AI) that develops algorithms to identify patterns in data...",
        categories: ["computer"],
        tags: ["ml", "ai"],
        author: reviewer._id,
      },
      {
        title: "Full‑stack Development",
        content: "Full‑stack developers work across both frontend and backend, ensuring seamless integration between UI and server logic...",
        categories: ["developer"],
        tags: ["mern", "javascript"],
        author: ranjith._id,
      },
      {
        title: "Cloud Computing",
        content: "Cloud computing provides scalable resources and services over the internet, enabling businesses to innovate faster...",
        categories: ["cloud"],
        tags: ["aws", "azure"],
        author: demo._id,
      },
    ];

    // Insert posts with category-specific fallback images
    for (const postData of postsData) {
      const primaryCategory = Array.isArray(postData.categories)
        ? postData.categories[0]
        : postData.categories;

      const coverImage =
        defaultImages[primaryCategory?.toLowerCase()] || defaultImages.generic;

      await Post.create({
        ...postData,
        coverImage,
        status: "published",
        isActive: true,
        analytics: { views: 0, sharesCount: 0, commentsCount: 0, likesCount: 0 },
      });
    }

    console.log("✅ Multi-author demo posts seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding posts:", err.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedPosts();
};

run();
