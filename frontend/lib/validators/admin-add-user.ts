import * as z from 'zod';

type AddUserValidationMessages = {
  emailInvalid: string;
  emailRequired: string;
  roleRequired: string;
  passwordMin: string;
  firstNameRequired?: string;
  lastNameRequired?: string;
  phoneNumberInvalid?: string;
  addressRequired?: string;
  dateOfBirthInvalid?: string;
};

export const createAddUserSchema = (messages: AddUserValidationMessages) =>
  z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z.string().min(6, messages.passwordMin),
    role: z.string().min(1, messages.roleRequired),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional()
  });

export type AddUserFormValues = z.infer<ReturnType<typeof createAddUserSchema>>;
