import * as z from 'zod';

type SignupValidationMessages = {
  roleRequired: string;
  emailInvalid: string;
  passwordMin: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
};

export const createSignupSchema = (messages: SignupValidationMessages) =>
  z
    .object({
      role: z.enum(['teacher', 'student'], {
        required_error: messages.roleRequired
      }),
      email: z.string().email(messages.emailInvalid),
      password: z.string().min(6, messages.passwordMin),
      confirmPassword: z.string().min(6, messages.confirmPasswordRequired)
    })
    .refine(values => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.confirmPasswordMismatch
    });

export type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;
