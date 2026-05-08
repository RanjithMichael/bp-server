// seedUsers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "Ranjith B",
    username: "ranjith",
    email: "ranjithmichael49@gmail.com",
    password: "password123", // will be hashed if your User model has pre-save middleware
    role: "author",
  },
  {
    name: "Demo Author",
    username: "demoauthor",
    email: "demo@example.com",
    password: "password123",
    role: "author",
  },
  {
    name: "Reviewer User",
    username: "reviewer",
    email: "reviewer@example.com",
    password: "password123",
    role: "author",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear old users
    await User.deleteMany({});
    console.log("✅ Old users removed");

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log("✅ New users added:", createdUsers.map(u => u.email));

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();
