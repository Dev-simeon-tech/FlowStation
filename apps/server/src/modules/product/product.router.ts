import Router from "express";
import { z } from "zod";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import { ProductController } from "./product.controller";
import {
  CreateFuelProductSchema,
  UpdateFuelProductSchema,
} from "@flowstation/schemas";

const controller = new ProductController();
export const router = Router();

router.use(authMiddleware);

const FuelProductIdSchema = z.object({
  id: z.uuid(),
});
router.get("/", controller.getFuelProducts);
router.post(
  "/setup",
  validationMiddleware({ body: CreateFuelProductSchema }),
  controller.createFuelProduct,
);
router.put(
  "/edit/:id",
  validationMiddleware({
    body: UpdateFuelProductSchema,
    params: FuelProductIdSchema,
  }),
  controller.updateFuelProduct,
);
router.delete(
  "/:id",
  validationMiddleware({ params: FuelProductIdSchema }),
  controller.deleteFuelProduct,
);
