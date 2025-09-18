import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],

    // ✅ Analytics field
    analytics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      shares: { type: Number, default: 0 },
      sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      comments: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

