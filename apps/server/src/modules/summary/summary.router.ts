import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import { z } from "zod";
import { SummaryController } from "./summary.controller";

const controller = new SummaryController();
export const router = Router();
const SummaryDateSchema = z.object({ date: z.string() });

router.use(authMiddleware);

router.get(
  "/",
  validationMiddleware({ params: SummaryDateSchema }),
  controller.dailySummary,
);

router.get("/history", controller.summaryHistory);
