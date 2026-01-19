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
    // optional: link back to post if you want standalone comment queries
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
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

    // ✅ Lifecycle status (removed replaces isDeleted)
    status: {
      type: String,
      enum: ["draft", "published", "removed"],
      default: "published",
      index: true,
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments (embedded)
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Slug Generator
postSchema.pre("save", async function (next) {
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

// Virtuals (for analytics UI)
postSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments?.length || 0;
});

postSchema.virtual("sharesCount").get(function () {
  return this.shares || 0;
});

// Enable virtuals in API response
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// Indexes for performance
postSchema.index({ author: 1, status: 1 });
postSchema.index({ slug: 1 });

const Post = mongoose.model("Post", postSchema);
export default Post;





