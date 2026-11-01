import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, ValidationMessages.REQUIRED),
  email: z.string().trim().email(ValidationMessages.INVALID_EMAIL),
  address: z
    .string()
    .trim()
    .min(3, ValidationMessages.ADDRESS_TOO_SHORT)
    .optional(),
  password: z.string().min(6, ValidationMessages.PASSWORD_TOO_SHORT),
});

export type RegisterFormInput = z.infer<typeof RegisterSchema>;
