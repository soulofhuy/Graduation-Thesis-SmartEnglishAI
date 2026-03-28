import * as z from 'zod';

export const createProfileSchema = () =>
  z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  });

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;
