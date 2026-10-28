import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import { CreateSaleSchema, SaleIdSchema } from "@flowstation/schemas";
import { SalesController } from "./sales.controller";

const controller = new SalesController();
export const router = Router();

router.use(authMiddleware);
router.get("/", controller.getSales);
router.get(
  "/:id",
  validationMiddleware({ params: SaleIdSchema }),
  controller.getSale,
);
router.post(
  "/new",
  validationMiddleware({ body: CreateSaleSchema }),
  controller.createSale,
);
