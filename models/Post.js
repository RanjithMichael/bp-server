import mongoose from "mongoose";
import slugify from "slugify";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    slug: { type: String, required: true, unique: true, index: true }, // ✅ enforce slug
    content: { type: String, required: true, minlength: 20 },
    coverImage: {
      type: String,
      required: false,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "removed"],
      default: "published",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    analytics: {
      views: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
      commentsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Slug generator
postSchema.pre("save", async function (next) {
  if (!this.title) return next();
  if (!this.isModified("title") && this.slug) return next();

  const baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;

  // ensure uniqueness
  while (await mongoose.models.Post.exists({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
  next();
});

// Virtuals
postSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});
postSchema.virtual("commentsCount").get(function () {
  return this.comments?.filter((c) => !c.isDeleted).length || 0;
});
postSchema.virtual("sharesCount").get(function () {
  return this.shares || 0;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

// Statics
postSchema.statics.toggleLike = async function (postId, userId) {
  const post = await this.findById(postId);
  if (!post) return null;
  const alreadyLiked = post.likes.includes(userId);
  post.likes = alreadyLiked
    ? post.likes.filter((id) => id.toString() !== userId.toString())
    : [...post.likes, userId];
  post.analytics.likesCount = post.likes.length;
  await post.save();
  return post;
};

postSchema.statics.incrementShare = async function (postId) {
  const post = await this.findById(postId);
  if (!post) return null;
  post.shares = (post.shares || 0) + 1;
  post.analytics.sharesCount = post.shares;
  await post.save();
  return post;
};

postSchema.statics.softDeleteComment = async function (postId, commentId) {
  const post = await this.findById(postId);
  if (!post) return null;
  const comment = post.comments.id(commentId);
  if (!comment) return null;
  comment.isDeleted = true;
  post.analytics.commentsCount = post.comments.filter((c) => !c.isDeleted).length;
  await post.save();
  return comment;
};

postSchema.statics.hardDeleteComment = async function (postId, commentId) {
  const post = await this.findById(postId);
  if (!post) return null;
  post.comments = post.comments.filter((c) => c._id.toString() !== commentId.toString());
  post.analytics.commentsCount = post.comments.filter((c) => !c.isDeleted).length;
  await post.save();
  return true;
};

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
