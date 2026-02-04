import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"], // optional safeguard
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
      index: true, // faster queries by post
    },
    context: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // optional: track admin/moderator who flagged/deleted
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

// Prevent model overwrite issues in dev/hot-reload
const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;