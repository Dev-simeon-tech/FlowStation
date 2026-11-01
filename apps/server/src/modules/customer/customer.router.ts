import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import {
  CreateCustomerSchema,
  CustomerIdSchema,
  UpdateCustomerSchema,
} from "@flowstation/schemas";
import { CustomerController } from "./customer.controller";

const controller = new CustomerController();
export const router = Router();

router.use(authMiddleware);
router.get("/", controller.getCustomers);
router.post(
  "/new",
  validationMiddleware({ body: CreateCustomerSchema }),
  controller.createCustomer,
);
router.get(
  "/:id/purchases",
  validationMiddleware({ params: CustomerIdSchema }),
  controller.getCustomerPurchases,
);
router.put(
  "/edit/:id",
  validationMiddleware({
    body: UpdateCustomerSchema,
    params: CustomerIdSchema,
  }),
  controller.updateCustomer,
);
