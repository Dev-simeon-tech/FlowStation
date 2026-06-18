import express from "express";
import protect from "../middleware/auth.js";
import {
  getDailySummary,
  generateDailySummary,
  getSummaryHistory,
} from "../controllers/summary.controller.js";

const router = express.Router();
router.get("/", protect, getDailySummary); // ?date=2026-06-16
router.get("/history", protect, getSummaryHistory); // all saved summaries
router.post("/generate", protect, generateDailySummary); // calculate & save for a date

export default router;
