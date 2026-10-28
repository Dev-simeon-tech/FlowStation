import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

const CustomerTypeSchema = z.enum(["WALK_IN", "REGISTERED"]);

export const CreateCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, ValidationMessages.CUSTOMER_NAME_REQUIRED),
  phone: z.string().trim().min(1).nullable().optional(),
  plateNumber: z.string().trim().min(1).nullable().optional(),
  customerType: CustomerTypeSchema.optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  ValidationMessages.CUSTOMER_REQUIRED,
);

export const CustomerIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
