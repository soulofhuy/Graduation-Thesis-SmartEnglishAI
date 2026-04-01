import type { Language } from '@/lib/translations';

export const classValidationMessages = {
  en: {
    nameUpdateRequired: 'Please enter the class name to update'
  },
  vi: {
    nameUpdateRequired: 'Không được để trống tên lớp học khi cập nhật'
  }
} as const;

export type ClassValidationMessages = (typeof classValidationMessages)['en'];

export const getClassValidationMessages = (language?: Language) =>
  classValidationMessages[language ?? 'vi'] ?? classValidationMessages.vi;
