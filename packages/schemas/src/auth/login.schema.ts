import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const LoginSchema = z.object({
  email: z.string().trim().email(ValidationMessages.INVALID_EMAIL),
  password: z.string().min(1, ValidationMessages.PASSWORD_REQUIRED),
});

export type LoginFormInput = z.infer<typeof LoginSchema>;
