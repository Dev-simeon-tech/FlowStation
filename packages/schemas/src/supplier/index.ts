import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

const OptionalTextSchema = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? null : value),
  z.string().trim().nullable().optional(),
);

export const CreateSupplierSchema = z.object({
  companyName: z.string().trim().min(1, ValidationMessages.REQUIRED),
  contactPerson: z.string().trim().min(1, ValidationMessages.REQUIRED),
  phone: z.string().trim().min(1, ValidationMessages.REQUIRED),
  email: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? null : value),
    z.string().trim().email().nullable().optional(),
  ),
  address: OptionalTextSchema,
});

export const SupplierIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
