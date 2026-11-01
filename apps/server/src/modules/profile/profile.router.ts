import Router from "express";
import { UpdateOrganisationProfileSchema } from "@flowstation/schemas";
import { authMiddleware } from "@/middleware/auth.middleware";
import { validationMiddleware } from "@/middleware/validation.middleware";
import { ProfileController } from "./profile.controller";

const controller = new ProfileController();
export const router = Router();

router.use(authMiddleware);
router.put(
  "/",
  validationMiddleware({ body: UpdateOrganisationProfileSchema }),
  controller.updateOrganisationProfile,
);
