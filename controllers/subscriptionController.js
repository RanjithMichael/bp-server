import asyncHandler from "express-async-handler";
import Subscription from "../models/Subscription.js";

// @desc Subscribe to an author or category
// @route POST /api/subscriptions
// @access Private
const createSubscription = asyncHandler(async (req, res) => {
  const { authorId, category } = req.body;

  if (!authorId && !category) {
    res.status(400);
    throw new Error("You must provide either an author or a category");
  }

  const subscription = new Subscription({
    user: req.user._id,
    author: authorId || null,
    category: category || null,
  });

  await subscription.save();
  res.status(201).json(subscription);
});

// @desc Get my subscriptions
// @route GET /api/subscriptions
// @access Private
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ user: req.user._id })
    .populate("author", "name email");
  res.json(subs);
});

// @desc Unsubscribe
// @route DELETE /api/subscriptions/:id
// @access Private
const deleteSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);

  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (sub.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await sub.deleteOne();
  res.json({ message: "Unsubscribed successfully" });
});

export { createSubscription, getMySubscriptions, deleteSubscription };
