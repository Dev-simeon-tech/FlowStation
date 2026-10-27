import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormInput = z.infer<typeof LoginSchema>;
