import Router from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import {
  AttendantIdSchema,
  CreateAttendantSchema,
  UpdateAttendantSchema,
  UpdateAttendantStatusSchema,
} from "@flowstation/schemas";
import { AttendantController } from "./attendant.controller";

const controller = new AttendantController();
export const router = Router();

router.use(authMiddleware);
router.get("/", controller.getAttendants);
router.post(
  "/new",
  validationMiddleware({ body: CreateAttendantSchema }),
  controller.createAttendant,
);
router.put(
  "/edit/:id",
  validationMiddleware({
    body: UpdateAttendantSchema,
    params: AttendantIdSchema,
  }),
  controller.updateAttendant,
);
router.patch(
  "/status/:id",
  validationMiddleware({
    body: UpdateAttendantStatusSchema,
    params: AttendantIdSchema,
  }),
  controller.updateAttendantStatus,
);
