import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import User from "./models/User.js";

dotenv.config();

// Simple slug generator
const makeSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // spaces → hyphens
    .replace(/[^a-z0-9\-]/g, ""); // remove non-alphanumeric

const defaultImages = {
  "data scientist": "https://res.cloudinary.com/djle175hb/image/upload/v1778841309/0_gMvS7ZBIoCX8-Mqe_emfljf.jpg",
  "business analyst": "https://res.cloudinary.com/djle175hb/image/upload/v1778841394/https_3A_2F_2Fwww.hbs.edu_2Fctfassets_2Fpublic_2Fimages_2F5zdIhFfQlGehyJLZCR11FB_2FBA_2520Image_sopvyb.webp",
  "computer coding": "https://res.cloudinary.com/djle175hb/image/upload/v1778841533/7200_myugxi.jpg",
  "machine learning": "https://res.cloudinary.com/djle175hb/image/upload/v1778841707/what-is-machine-learning-1024x683_vbjhb6.png",
  "artificial intelligence": "https://res.cloudinary.com/djle175hb/image/upload/v1778841815/where-is-ai-used_vbmbey.jpg",
  "html & css":"https://res.cloudinary.com/djle175hb/image/upload/v1778841882/1_lJ32Bl-lHWmNMUSiSq17gQ_erfbwd.png",
  "web development":"https://res.cloudinary.com/djle175hb/image/upload/v1778842008/1_V-Jp13LvtVc2IiY2fp4qYw_n6djkw.jpg",
  "mobile app development":"https://res.cloudinary.com/djle175hb/image/upload/v1778842101/7115055_1997_2_ldotl5.jpg",
  "cybersecurity":"https://res.cloudinary.com/djle175hb/image/upload/v1778842174/Cybersecurity_certiprof_t8uqpa.jpg",
  default: "https://res.cloudinary.com/djle175hb/image/upload/v1778771435/DALL_C2_B7E-2025-02-11-18.59.04-A-modern-and-professional-illustration-depicting-a-computer-programmer-working-on-code.-The-image-should-feature-a-clean-workspace-with-a-laptop-displ_vkl7n2.webp"
};

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // ⚠️ Clear old posts
    await Post.deleteMany({});
    console.log("🗑️ Old posts cleared");

    // Grab multiple demo users
    const demoUsers = await User.find().limit(3);
    if (demoUsers.length < 3) {
      console.error("❌ Need at least 3 demo users. Seed users first!");
      process.exit(1);
    }

    
    const demoPosts = [
      {
        title: "Intro to Data Science",
        slug: makeSlug("Intro to Data Science"),
        content: "Seeded demo post about Data Science...",
        categories: ["data scientist"],
        coverImage: defaultImages["data scientist"],
        author: demoUsers[0]._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Business Analyst Basics",
        slug: makeSlug("Business Analyst Basics"),
        content: "Seeded demo post about Business Analysis...",
        categories: ["business analyst"],
        coverImage: defaultImages["business analyst"],
        author: demoUsers[1]._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Getting Started with Web Development",
        slug: makeSlug("Getting Started with Web Development"),
        content: "Seeded demo post about Web Development...",
        categories: ["web development"],
        coverImage: defaultImages["web development"],
        author: demoUsers[2]._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Cybersecurity Essentials",
        slug: makeSlug("Cybersecurity Essentials"),
        content: "Seeded demo post about Cybersecurity...",
        categories: ["cybersecurity"],
        coverImage: defaultImages["cybersecurity"],
        author: demoUsers[0]._id,
        status: "published",
        isActive: true,
      }
    ];

    await Post.insertMany(demoPosts);
    console.log("✅ Multi-author demo posts seeded successfully!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding posts:", err);
    process.exit(1);
  }
};

seedPosts();
