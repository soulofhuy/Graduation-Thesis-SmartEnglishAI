import * as z from 'zod';
import { getClassValidationMessages } from '../validation-translators/class';

export const createClassSchema = () =>
  z.object({
    name: z.string().min(1, 'Tên lớp học là bắt buộc'),
    description: z.string().optional(),
    needsTeacherApproval: z.boolean().default(false)
  });

export const updateClassSchema = () =>
  z.object({
    name: z
      .string()
      .min(1, getClassValidationMessages().nameUpdateRequired)
      .optional(),
    description: z.string().optional(),
    classCode: z.string().optional(),
    needsTeacherApproval: z.boolean().optional()
  });

export type ClassFormValues = z.infer<ReturnType<typeof createClassSchema>>;
export type UpdateClassFormValues = z.infer<
  ReturnType<typeof updateClassSchema>
>;
