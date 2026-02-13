import express from "express";
import {
  createSubscription,
  getMySubscriptions,
  deleteSubscription,
  getSubscriptionStatus,
  subscribeAuthor,
  unsubscribeAuthor,
} from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// General subscriptions (author or category via body)

router.route("/")
  .post(protect, createSubscription)   // POST /api/subscriptions
  .get(protect, getMySubscriptions);   // GET /api/subscriptions

// Delete by subscription ID (legacy / specific subscription)
router.route("/id/:id").delete(protect, deleteSubscription); // DELETE /api/subscriptions/id/:id

// Author-specific subscriptions (via URL param)

router.route("/author/:authorId")
  .post(protect, subscribeAuthor)      // POST /api/subscriptions/author/:authorId
  .delete(protect, unsubscribeAuthor); // DELETE /api/subscriptions/author/:authorId

// Check subscription status for a specific author
router.get("/status/:authorId", protect, getSubscriptionStatus); // GET /api/subscriptions/status/:authorId

export default router;
