import * as z from 'zod';

export const createClassSchema = () =>
  z.object({
    name: z.string().min(1, 'Tên lớp học là bắt buộc'),
    description: z.string().optional(),
    needsTeacherApproval: z.boolean().default(false)
  });

export type ClassFormValues = z.infer<ReturnType<typeof createClassSchema>>;
