import { z } from "zod";
import { ValidationMessages } from "../validation-messages";

export const CreateAttendantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, ValidationMessages.ATTENDANT_NAME_REQUIRED),
  employeeId: z
    .string()
    .trim()
    .min(1, ValidationMessages.ATTENDANT_EMPLOYEE_ID_REQUIRED),
  phone: z
    .string()
    .trim()
    .min(1, ValidationMessages.ATTENDANT_PHONE_REQUIRED),
  pumpAssigned: z.string().trim().nullable().optional(),
});

export const UpdateAttendantSchema = CreateAttendantSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  ValidationMessages.ATTENDANT_REQUIRED,
);

export const UpdateAttendantStatusSchema = z.object({
  isActive: z.boolean({
    required_error: ValidationMessages.ATTENDANT_STATUS_REQUIRED,
    invalid_type_error: ValidationMessages.ATTENDANT_STATUS_REQUIRED,
  }),
});

export const AttendantIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAttendantInput = z.infer<typeof CreateAttendantSchema>;
export type UpdateAttendantInput = z.infer<typeof UpdateAttendantSchema>;
export type UpdateAttendantStatusInput = z.infer<
  typeof UpdateAttendantStatusSchema
>;
