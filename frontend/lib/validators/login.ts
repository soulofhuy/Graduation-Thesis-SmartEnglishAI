import * as z from 'zod';

type LoginValidationMessages = {
  emailInvalid: string;
  passwordMin: string;
};

export const createLoginSchema = (messages: LoginValidationMessages) =>
  z.object({
    email: z.string().email(messages.emailInvalid),
    password: z.string().min(6, messages.passwordMin)
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
