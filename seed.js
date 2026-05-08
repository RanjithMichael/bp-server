import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import User from "./models/User.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    //Find demo author
    const author = await User.findOne({ email: "demo@example.com" });
    if (!author) {
      throw new Error("Demo author not found. Run seedUsers.js first.");
    }

    const posts = [
      {
        title: "Power of Education",
        content: "Education empowers us to overcome failures and grow stronger.",
        coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
        categories: ["Education", "Motivation"],
        tags: ["Learning", "Growth"],
        author: author._id,
        status: "published",
        isActive: true,
        analytics: { views: 0, likesCount: 10, sharesCount: 3, commentsCount: 0 },
      },
      {
        title: "Exploring React",
        content: "React makes building dynamic UIs simple and efficient.",
        coverImage: "https://images.unsplash.com/photo-1581276879432-15a19d654956",
        categories: ["React", "Frontend"],
        tags: ["JavaScript", "UI"],
        author: author._id,
        status: "published",
        isActive: true,
        analytics: { views: 0, likesCount: 5, sharesCount: 2, commentsCount: 0 },
      },
      {
        title: "TailwindCSS Tips",
        content: "Utility-first CSS helps you design faster and cleaner.",
        coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
        categories: ["CSS", "Tailwind"],
        tags: ["Design", "Styling"],
        author: author._id,
        status: "published",
        isActive: true,
        analytics: { views: 0, likesCount: 7, sharesCount: 4, commentsCount: 0 },
      },
    ];

    //Clear old posts and insert new ones
    await Post.deleteMany({});
    console.log("✅ Old posts removed");

    await Post.insertMany(posts);
    console.log("✅ New posts added");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
