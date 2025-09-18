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
    },
    category: {
      type: String,
    },
  },
  { timestamps: true }
);

// A subscription must be either for an author OR a category
subscriptionSchema.index({ user: 1, author: 1 }, { unique: true, sparse: true });
subscriptionSchema.index({ user: 1, category: 1 }, { unique: true, sparse: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
