import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: 3,
    },
    slug: {
      type: String,
      unique: true,
      index: true, // better query performance
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },

    // Analytics & Interactions
    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      shares: { type: Number, default: 0 },
      sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      comments: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          text: { type: String, required: true, trim: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

// Auto-generate unique slug before saving
postSchema.pre("validate", async function (next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    // Ensure slug uniqueness in DB
    while (await mongoose.models.Post.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});

// Optional: virtual for comments count, etc.
postSchema.virtual("commentCount").get(function () {
  return this.analytics.comments.length;
});

const Post = mongoose.model("Post", postSchema);

export default Post;




