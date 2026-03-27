import type { Language } from '@/lib/translations';

export const authValidationMessages = {
  en: {
    roleRequired: 'Please choose a role',
    emailInvalid: 'Please enter a valid email address',
    passwordMin: 'Password must be at least 6 characters',
    confirmPasswordRequired: 'Please confirm your password',
    confirmPasswordMismatch: 'Passwords do not match'
  },
  vi: {
    roleRequired: 'Vui lòng chọn vai trò',
    emailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ',
    passwordMin: 'Mật khẩu phải có ít nhất 6 ký tự',
    confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu',
    confirmPasswordMismatch: 'Mật khẩu xác nhận không khớp'
  }
} as const;

export type AuthValidationMessages = (typeof authValidationMessages)['en'];

export const getAuthValidationMessages = (language?: Language) =>
  authValidationMessages[language ?? 'vi'] ?? authValidationMessages.vi;
