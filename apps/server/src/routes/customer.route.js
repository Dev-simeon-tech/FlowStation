import express from "express";
import {
  getCustomers,
  createCustomer,
} from "../controllers/customer.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCustomers);
router.post("/new", protect, createCustomer);

export default router;
