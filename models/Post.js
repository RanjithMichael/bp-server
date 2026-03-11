import mongoose from "mongoose";
import slugify from "slugify";

// 🔹 Embedded Comment Schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔹 Post Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      minlength: [20, "Content must be at least 20 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "removed"],
      default: "published",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    comments: [commentSchema], // embedded comments
  },
  { timestamps: true }
);

// 🔹 Slug Generator
postSchema.pre("save", async function (next) {
  if (!this.title || !this.isModified("title")) return next();

  const baseSlug = slugify(this.title, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  // Ensure unique slug
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

// 🔹 Virtuals (analytics UI)
postSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

postSchema.virtual("commentsCount").get(function () {
  return this.comments?.filter((c) => !c.isDeleted).length || 0;
});

postSchema.virtual("sharesCount").get(function () {
  return this.shares || 0;
});

// 🔹 Enable virtuals in API response
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// 🔹 Indexes for performance & search
postSchema.index({ author: 1, status: 1 });
postSchema.index({ slug: 1 });
postSchema.index({
  title: "text",
  content: "text",
  tags: "text",
  categories: "text",
});

// 🔹 Static helpers for safe comment management
postSchema.statics.softDeleteComment = async function (postId, commentId) {
  const post = await this.findById(postId);
  if (!post) return null;

  const comment = post.comments.id(commentId);
  if (!comment) return null;

  comment.isDeleted = true;
  await post.save();

  return comment;
};

postSchema.statics.hardDeleteComment = async function (postId, commentId) {
  const post = await this.findById(postId);
  if (!post) return null;

  // Remove comment entirely from array
  post.comments = post.comments.filter(
    (c) => c._id.toString() !== commentId.toString()
  );
  await post.save();

  return true;
};

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;