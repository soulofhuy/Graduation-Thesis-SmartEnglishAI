import * as z from 'zod';

type ChangePasswordValidationMessages = {
  currentPasswordRequired: string;
  passwordMin: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
};

export const createChangePasswordSchema = (
  messages: ChangePasswordValidationMessages
) =>
  z
    .object({
      currentPassword: z.string().min(1, messages.currentPasswordRequired),
      newPassword: z.string().min(6, messages.passwordMin),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired)
    })
    .refine(values => values.newPassword === values.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.confirmPasswordMismatch
    });

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
