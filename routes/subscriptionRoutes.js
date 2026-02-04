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

// General subscription routes (author or category via body)
router.route("/")
  .post(protect, createSubscription)   // POST /api/subscriptions
  .get(protect, getMySubscriptions);   // GET /api/subscriptions

// Delete by subscription ID (legacy method)
router.route("/:id").delete(protect, deleteSubscription);

// Author-specific routes
router.route("/:authorId")
  .post(protect, subscribeAuthor)      // POST /api/subscriptions/:authorId
  .delete(protect, unsubscribeAuthor); // DELETE /api/subscriptions/:authorId

router.get("/status/:authorId", protect, getSubscriptionStatus); // GET /api/subscriptions/status/:authorId

export default router;