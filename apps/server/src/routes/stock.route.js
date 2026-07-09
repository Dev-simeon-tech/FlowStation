import express from "express";
import protect from "../middleware/auth.js";
import {
  getAllStockEntries,
  getStockById,
  createStockEntry,
  getStockBalance,
} from "../controllers/stock.controller.js";

const router = express.Router();

router.get("/", protect, getAllStockEntries); // all delivery records
router.get("/balance", protect, getStockBalance); // current stock per fuel type
router.get("/:id", protect, getStockById); // single delivery details
router.post("/new", protect, createStockEntry); // record a new delivery

export default router;
