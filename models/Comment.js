import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true, // ✅ ensures no accidental whitespace
      minlength: 1,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // ✅ Optional context field (e.g., reply, feedback type)
    context: {
      type: String,
      trim: true,
      default: null,
    },
    // ✅ Soft delete flag for moderation
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtuals for UI convenience
commentSchema.virtual("isActive").get(function () {
  return !this.isDeleted;
});

// Enable virtuals in API response
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;



