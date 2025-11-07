import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can’t subscribe to the same author twice
subscriptionSchema.index(
  { user: 1, author: 1 },
  { unique: true, sparse: true }
);

// Ensure a user can’t subscribe to the same category twice
subscriptionSchema.index(
  { user: 1, category: 1 },
  { unique: true, sparse: true }
);

// Validation to ensure one of author or category is provided
subscriptionSchema.pre("save", function (next) {
  if (!this.author && !this.category) {
    return next(new Error("Subscription must have either an author or a category"));
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;

