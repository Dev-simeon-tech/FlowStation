import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Station name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(3, "Address must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
