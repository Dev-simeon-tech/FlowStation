import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import {
  CreateStockEntrySchema,
  StockEntryIdSchema,
} from "@flowstation/schemas";
import { StockController } from "./stock.controller";

const controller = new StockController();
export const router = Router();

router.use(authMiddleware);
router.get("/", controller.getStockEntries);
router.get("/balance", controller.getStockBalance);
router.get(
  "/:id",
  validationMiddleware({ params: StockEntryIdSchema }),
  controller.getStockEntry,
);
router.post(
  "/new",
  validationMiddleware({ body: CreateStockEntrySchema }),
  controller.createStockEntry,
);
