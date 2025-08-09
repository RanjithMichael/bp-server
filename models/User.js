import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Optional: Add roles or profile picture if needed
    // role: { type: String, default: "user" },
    // profilePic: { type: String },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);
export default User;


