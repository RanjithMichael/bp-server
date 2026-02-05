import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to DB
    await mongoose.connect(
      process.env.MONGO_URI || "MONGO_URI=mongodb+srv://backiarajranjithmichael:Ranjith_2025@cluster0.glqkwsu.mongodb.net/blogging-platform?retryWrites=true&w=majority"
    );
    console.log("🔗 Connected to MongoDB");

    // Optional: clear old users (⚠️ be careful in production!)
    await User.deleteMany({});
    console.log("🧹 Cleared old users");

    // Create sample users
    const users = [
      {
        name: "Alice Developer",
        username: "alice",
        email: "alice@example.com",
        password: bcrypt.hashSync("password123", 10),
        bio: "Full‑stack developer exploring MERN stack.",
        socialLinks: {
          website: "https://alice.dev",
          twitter: "https://twitter.com/alice",
          linkedin: "https://linkedin.com/in/alice",
          github: "https://github.com/alice",
        },
        role: "author",
      },
      {
        name: "Bob Designer",
        username: "bob",
        email: "bob@example.com",
        password: bcrypt.hashSync("password123", 10),
        bio: "UI/UX designer passionate about TailwindCSS.",
        socialLinks: {
          website: "https://bob.design",
          twitter: "https://twitter.com/bob",
          linkedin: "https://linkedin.com/in/bob",
          github: "https://github.com/bob",
        },
        role: "author",
      },
    ];

    const result = await User.insertMany(users);
    result.forEach((u) =>
      console.log(`✅ Added user: ${u.name} (${u.email})`)
    );

    console.log("🌱 User seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

seedUsers();