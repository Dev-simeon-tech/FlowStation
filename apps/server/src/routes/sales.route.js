import express from "express";
import protect from "../middleware/auth.js";
import {
  getAllSales,
  getSaleById,
  createSale,
} from "../controllers/sales.controller.js";

const router = express.Router();

router.get("/", protect, getAllSales);
router.get("/:id", protect, getSaleById);
router.post("/new", protect, createSale);

export default router;
