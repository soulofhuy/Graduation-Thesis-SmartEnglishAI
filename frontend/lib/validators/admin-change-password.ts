import * as z from 'zod';

type AdminChangePasswordValidationMessages = {
  passwordMin: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
};

export const createChangePasswordSchema = (
  messages: AdminChangePasswordValidationMessages
) =>
  z
    .object({
      newPassword: z.string().min(6, messages.passwordMin),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired)
    })
    .refine(values => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.confirmPasswordMismatch
    });

export type AdminChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
