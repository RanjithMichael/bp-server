import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "../models/Post.js"; // adjust path if needed

dotenv.config();

const migrateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const posts = await Post.find({ category: { $exists: true, $ne: null } });
    console.log(`Found ${posts.length} posts to migrate`);

    for (const post of posts) {
      if (typeof post.category === "string" && post.category.trim() !== "") {
        post.categories = [post.category.trim()];
      }
      post.category = undefined; // remove old field
      await post.save();
      console.log(`Migrated post: ${post._id}`);
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrateCategories();