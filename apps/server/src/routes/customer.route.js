import express from "express";
import {
  getCustomers,
  createCustomer,
  getCustomerPurchases,
  editCustomer,
} from "../controllers/customer.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCustomers);
router.post("/new", protect, createCustomer);
router.get("/:id/purchases", protect, getCustomerPurchases);
router.put("/edit/:id", protect, editCustomer);

export default router;
