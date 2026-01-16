import mongoose from "mongoose";
import slugify from "slugify";

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Post Schema
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
      index: true,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    // ✅ New fields for post lifecycle
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Analytics
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      shares: {
        type: Number,
        default: 0,
      },
    },

    // Comments
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Slug Generator
postSchema.pre("validate", async function (next) {
  if (!this.title || !this.isModified("title")) return next();

  const baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  while (
    await mongoose.models.Post.exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

// Virtuals (IMPORTANT for analytics UI)
postSchema.virtual("likesCount").get(function () {
  return this.analytics?.likes?.length || 0;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

// Enable virtuals in API response
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// Model
const Post = mongoose.model("Post", postSchema);
export default Post;






