import mongoose from "mongoose";
import Post from "./Post.js"; 
import User from "./User.js"; 

const seedPosts = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/blogging_platform");

    // Find an existing user to assign as author
    const author = await User.findOne();
    if (!author) {
      console.log("⚠️ No users found. Please create a user first.");
      return;
    }

    const posts = [
      {
        title: "Getting Started with MERN",
        content: "<p>This is a sample blog post about MERN stack basics.</p>",
        author: author._id,
        category: "Tech",
        tags: ["mern", "react", "mongodb"],
      },
      {
        title: "Why TailwindCSS Rocks",
        content: "<p>TailwindCSS makes styling fast and consistent.</p>",
        author: author._id,
        category: "Design",
        tags: ["tailwind", "css", "frontend"],
      },
    ];

    await Post.insertMany(posts);
    console.log("✅ Seeded posts successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPosts();