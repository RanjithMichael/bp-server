import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Tag name must be at least 2 characters"],
      maxlength: [30, "Tag name must not exceed 30 characters"],
      lowercase: true, // normalize to avoid duplicates
    },
  },
  { timestamps: true }
);

// Prevent model overwrite issues in dev/hot-reload
const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

export default Tag;
