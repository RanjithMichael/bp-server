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
    return res.status(400).json({ success: false, message: "You must provide either an author or a category" });
  }

  const normalizedCategory = category ? category.trim().toLowerCase() : null;

  // Prevent duplicate subscriptions (case-insensitive for category)
  const existing = await Subscription.findOne({
    user: req.user._id,
    ...(authorId && { author: authorId }),
    ...(normalizedCategory && { category: { $regex: `^${normalizedCategory}$`, $options: "i" } }),
  }).lean();

  if (existing) {
    return res.status(400).json({ success: false, message: "Already subscribed" });
  }

  const subscription = new Subscription({
    user: req.user._id,
    author: authorId || null,
    category: normalizedCategory || null,
  });

  await subscription.save();

  res.status(201).json({
    success: true,
    message: "Subscribed successfully",
    data: {
      id: subscription._id,
      user: subscription.user,
      author: subscription.author,
      category: subscription.category,
    },
  });
});

/**
 * @desc Get logged-in user's subscriptions
 * @route GET /api/subscriptions
 * @access Private
 */
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ user: req.user._id })
    .populate("author", "name email")
    .lean();

  res.json({
    success: true,
    count: subs.length,
    data: subs.map(sub => ({
      id: sub._id,
      user: sub.user,
      author: sub.author || null,
      category: sub.category || null,
    })),
  });
});

/**
 * @desc Unsubscribe by subscription ID
 * @route DELETE /api/subscriptions/:id
 * @access Private
 */
const deleteSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);

  if (!sub) {
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  if (sub.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  await sub.deleteOne();

  res.json({
    success: true,
    message: "Unsubscribed successfully",
    data: { id: sub._id, user: sub.user, author: sub.author, category: sub.category },
  });
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
  }).lean();

  res.json({
    success: true,
    subscribed: !!existing,
    subscriptionId: existing?._id || null,
  });
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
  }).lean();

  if (existing) {
    return res.status(400).json({ success: false, message: "Already subscribed" });
  }

  const subscription = new Subscription({
    user: req.user._id,
    author: authorId,
  });

  await subscription.save();

  res.status(201).json({
    success: true,
    message: "Subscribed successfully",
    data: {
      id: subscription._id,
      user: subscription.user,
      author: subscription.author,
      category: subscription.category,
    },
  });
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
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  await sub.deleteOne();

  res.json({
    success: true,
    message: "Unsubscribed successfully",
    data: { id: sub._id, user: sub.user, author: sub.author },
  });
});

export {
  createSubscription,
  getMySubscriptions,
  deleteSubscription,
  getSubscriptionStatus,
  subscribeAuthor,
  unsubscribeAuthor,
};
