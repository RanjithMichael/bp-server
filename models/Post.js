import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  category: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;
