import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import Post from "./Post.js";
import User from "./User.js";

dotenv.config();

const seedPosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogging_platform"
    );
    console.log("🔗 Connected to MongoDB");

    // Find an existing user to assign as author
    const author = await User.findOne();
    if (!author) {
      console.log("⚠️ No users found. Please create a user first.");
      return;
    }

    // Optional: clear old posts (be careful in production!)
    await Post.deleteMany({});
    console.log("🧹 Cleared old posts");

    // Posts to insert
    const posts = [
      {
        title: "Getting Started with MERN",
        slug: slugify("Getting Started with MERN", { lower: true, strict: true }),
        content: "<p>This is a sample blog post about MERN stack basics.</p>",
        author: author._id,
        category: "Tech",
        tags: ["mern", "react", "mongodb"],
      },
      {
        title: "Why TailwindCSS Rocks",
        slug: slugify("Why TailwindCSS Rocks", { lower: true, strict: true }),
        content: "<p>TailwindCSS makes styling fast and consistent.</p>",
        author: author._id,
        category: "Design",
        tags: ["tailwind", "css", "frontend"],
      },
      {
        title: "Debugging MongoDB & Mongoose",
        slug: slugify("Debugging MongoDB & Mongoose", { lower: true, strict: true }),
        content: "<p>Tips for handling common errors in MongoDB and Mongoose.</p>",
        author: author._id,
        category: "Backend",
        tags: ["mongodb", "mongoose", "debugging"],
      },
    ];

    // Insert posts
    const result = await Post.insertMany(posts);
    result.forEach((p) =>
      console.log(`✅ Added: ${p.title} (slug: ${p.slug})`)
    );

    console.log("🌱 Seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding posts:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

seedPosts();