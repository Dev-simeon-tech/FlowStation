import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import {
  CreateSupplierSchema,
  SupplierIdSchema,
} from "@flowstation/schemas";
import { SupplierController } from "./supplier.controller";

const controller = new SupplierController();
export const router = Router();

router.use(authMiddleware);
router.get("/", controller.getSuppliers);
router.post(
  "/new",
  validationMiddleware({ body: CreateSupplierSchema }),
  controller.createSupplier,
);
router.delete(
  "/:id",
  validationMiddleware({ params: SupplierIdSchema }),
  controller.deleteSupplier,
);
