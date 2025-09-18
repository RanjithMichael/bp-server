import express from "express";
import {
  createSubscription,
  getMySubscriptions,
  deleteSubscription,
} from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createSubscription)
  .get(protect, getMySubscriptions);

router.route("/:id").delete(protect, deleteSubscription);

export default router;
