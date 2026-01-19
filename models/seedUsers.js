import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to DB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogging_platform"
    );

    // Optional: clear old users
    await User.deleteMany({});

    // Create sample users
    const users = [
      {
        name: "Alice Developer",
        username: "alice",
        email: "alice@example.com",
        password: bcrypt.hashSync("password123", 10),
        bio: "Full‑stack developer exploring MERN stack.",
        social: {
          website: "https://alice.dev",
          twitter: "https://twitter.com/alice",
          linkedin: "https://linkedin.com/in/alice",
          github: "https://github.com/alice",
        },
      },
      {
        name: "Bob Designer",
        username: "bob",
        email: "bob@example.com",
        password: bcrypt.hashSync("password123", 10),
        bio: "UI/UX designer passionate about TailwindCSS.",
        social: {
          website: "https://bob.design",
          twitter: "https://twitter.com/bob",
          linkedin: "https://linkedin.com/in/bob",
          github: "https://github.com/bob",
        },
      },
    ];

    const result = await User.insertMany(users);
    result.forEach((u) => console.log(`✅ Added user: ${u.name} (${u.email})`));

    await mongoose.disconnect();
    console.log("🌱 User seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedUsers();