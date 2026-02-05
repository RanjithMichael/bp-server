import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import User from "./models/User.js";

// Load environment variables from .env
dotenv.config();

const seedPosts = async () => {
  try {
    // Connect to MongoDB Atlas using the URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB Atlas");

    // Pick a demo author (first user in DB or create one)
    let author = await User.findOne();
    if (!author) {
      author = await User.create({
        name: "Demo Author",
        email: "demo@example.com",
        password: "password123", // make sure your User model hashes passwords
        role: "author",
      });
      console.log("👤 Demo author created");
    }

    const posts = [
      {
        title: "Getting Started with MERN",
        slug: "getting-started-with-mern",
        category: "Tech",
        tags: ["MERN", "JavaScript", "WebDev"],
        content: `
          <h2>Introduction</h2>
          <p>The MERN stack combines MongoDB, Express, React, and Node.js.</p>
          <ul>
            <li>MongoDB for database</li>
            <li>Express for backend</li>
            <li>React for frontend</li>
            <li>Node.js for runtime</li>
          </ul>
        `,
        image: "uploads/images/sample1.jfif", // ✅ Tech image
        author: author._id,
        status: "published",
        isActive: true,
        comments: [
          {
            user: author._id,
            text: "This is a great intro to MERN!",
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Why TailwindCSS Rocks",
        slug: "why-tailwindcss-rocks",
        category: "Tech",
        tags: ["CSS", "Tailwind", "Design"],
        content: `
          <h2>Utility-first CSS</h2>
          <p>TailwindCSS lets you build modern UIs quickly.</p>
          <p>It’s responsive, customizable, and developer-friendly.</p>
        `,
        image: "uploads/images/sample2.jfif", // ✅ CSS/UI image
        author: author._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Debugging MongoDB & Mongoose",
        slug: "debugging-mongodb-mongoose",
        category: "Tutorials",
        tags: ["MongoDB", "Mongoose", "Debugging"],
        content: `
          <h2>Common Issues</h2>
          <p>Connection errors, schema mismatches, and query bugs are frequent.</p>
          <h3>Tips</h3>
          <ul>
            <li>Check your connection string</li>
            <li>Validate schema definitions</li>
            <li>Use logging for queries</li>
          </ul>
        `,
        image: "uploads/images/sample3.jfif", // ✅ Debugging image
        author: author._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Healthy Morning Routine",
        slug: "healthy-morning-routine",
        category: "Lifestyle",
        tags: ["Health", "Routine", "Wellness"],
        content: `
          <h2>Start Your Day Right</h2>
          <p>Wake up early, hydrate, and exercise.</p>
          <p>Consistency builds discipline and energy.</p>
        `,
        image: "uploads/images/sample4.jfif", // ✅ Lifestyle image
        author: author._id,
        status: "published",
        isActive: true,
      },
      {
        title: "Top Tech News of 2026",
        slug: "top-tech-news-2026",
        category: "News",
        tags: ["Tech", "AI", "Innovation"],
        content: `
          <h2>Highlights</h2>
          <p>AI breakthroughs, new frameworks, and global tech trends.</p>
        `,
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", // ✅ News/AI image
        author: author._id,
        status: "published",
        isActive: true,
      },
    ];

    // Clear old posts and insert new ones
    await Post.deleteMany({});
    await Post.insertMany(posts);

    console.log("🌱 Demo posts seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding posts:", err);
    process.exit(1);
  }
};

seedPosts();