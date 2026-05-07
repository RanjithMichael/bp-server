// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/Post.js";

dotenv.config();

const posts = [
  {
    title: "Power of Education",
    content: "Education empowers us to overcome failures and grow stronger.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b", // valid Unsplash image
    categories: ["Education", "Motivation"],
    author: "Ranjith B",
    likes: 10,
    shares: 3,
  },
  {
    title: "Exploring React",
    content: "React makes building dynamic UIs simple and efficient.",
    imageUrl: "https://images.unsplash.com/photo-1581276879432-15a19d654956",
    categories: ["React", "Frontend"],
    author: "Unknown Author",
    likes: 5,
    shares: 2,
  },
  {
    title: "TailwindCSS Tips",
    content: "Utility-first CSS helps you design faster and cleaner.",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    categories: ["CSS", "Tailwind"],
    author: "Unknown Author",
    likes: 7,
    shares: 4,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear old posts
    await Post.deleteMany({});
    console.log("Old posts removed");

    // Insert new posts
    await Post.insertMany(posts);
    console.log("New posts added");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
