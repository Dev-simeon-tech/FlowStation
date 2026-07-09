import express from "express";
import {
  getSuppliers,
  createSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("", protect, getSuppliers);
router.post("/new", protect, createSupplier);
router.delete("/:id", protect, deleteSupplier);

export default router;
