import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

const OptionalTextSchema = z.string().trim().nullable().optional();

export const CreateSupplierSchema = z.object({
  companyName: z.string().trim().min(1),
  contactPerson: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().email().nullable().optional(),
  address: OptionalTextSchema,
  fuelProductId: z.string().uuid().optional(),
});

export const SupplierIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
