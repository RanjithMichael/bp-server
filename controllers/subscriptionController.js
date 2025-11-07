import asyncHandler from "express-async-handler";
import Subscription from "../models/Subscription.js";

/**
 * @desc Subscribe to an author or category (via body)
 * @route POST /api/subscriptions
 * @access Private
 */
const createSubscription = asyncHandler(async (req, res) => {
  const { authorId, category } = req.body;

  if (!authorId && !category) {
    res.status(400);
    throw new Error("You must provide either an author or a category");
  }

  // Prevent duplicate subscriptions
  const existing = await Subscription.findOne({
    user: req.user._id,
    ...(authorId && { author: authorId }),
    ...(category && { category }),
  });

  if (existing) {
    res.status(400);
    throw new Error("Already subscribed");
  }

  const subscription = new Subscription({
    user: req.user._id,
    author: authorId || null,
    category: category || null,
  });

  await subscription.save();
  res.status(201).json(subscription);
});

/**
 * @desc Get logged-in user's subscriptions
 * @route GET /api/subscriptions
 * @access Private
 */
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ user: req.user._id }).populate(
    "author",
    "name email"
  );
  res.json(subs);
});

/**
 * @desc Unsubscribe by subscription ID
 * @route DELETE /api/subscriptions/:id
 * @access Private
 */
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

/**
 * @desc Get subscription status for an author
 * @route GET /api/subscriptions/status/:authorId
 * @access Private
 */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const existing = await Subscription.findOne({
    user: req.user._id,
    author: authorId,
  });

  res.json({ subscribed: !!existing });
});

/**
 * @desc Subscribe to an author (via URL param)
 * @route POST /api/subscriptions/:authorId
 * @access Private
 */
const subscribeAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const existing = await Subscription.findOne({
    user: req.user._id,
    author: authorId,
  });

  if (existing) {
    res.status(400);
    throw new Error("Already subscribed");
  }

  const subscription = new Subscription({
    user: req.user._id,
    author: authorId,
  });

  await subscription.save();
  res.status(201).json({ message: "Subscribed successfully" });
});

/**
 * @desc Unsubscribe from an author (via URL param)
 * @route DELETE /api/subscriptions/:authorId
 * @access Private
 */
const unsubscribeAuthor = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const sub = await Subscription.findOne({
    user: req.user._id,
    author: authorId,
  });

  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  await sub.deleteOne();
  res.json({ message: "Unsubscribed successfully" });
});

export {
  createSubscription,
  getMySubscriptions,
  deleteSubscription,
  getSubscriptionStatus,
  subscribeAuthor,
  unsubscribeAuthor,
};
