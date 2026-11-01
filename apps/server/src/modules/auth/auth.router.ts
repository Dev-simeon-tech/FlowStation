import Router from "express";
import z from "zod";
import { AuthController } from "./auth.controller";
import { validationMiddleware } from "@/middleware";
import { LoginSchema, RegisterSchema } from "@flowstation/schemas";

const controller = new AuthController();
export const router = Router();
const RefreshSchema = z.object({ refreshToken: z.string().optional() });
router.post(
  "/register",
  validationMiddleware({ body: RegisterSchema }),
  controller.register,
);
router.post(
  "/login",
  validationMiddleware({ body: LoginSchema }),
  controller.login,
);
router.post(
  "/refresh",
  validationMiddleware({ body: RefreshSchema }),
  controller.refresh,
);
router.post(
  "/logout",
  validationMiddleware({ body: RefreshSchema }),
  controller.logout,
);
