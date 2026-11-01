import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const UpdateOrganisationProfileSchema = z.object({
  name: z.string().trim().min(2, ValidationMessages.REQUIRED),
  address: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export type UpdateOrganisationProfileInput = z.infer<
  typeof UpdateOrganisationProfileSchema
>;
