import type { Language } from '@/lib/translations';

export const toastMessages = {
  en: {
    restoreSuccess: 'Restore successful',
    restoreFailed: 'Restore failed',
    deleteSuccess: 'Delete successful',
    deleteFailed: 'Delete failed',
    loadSuccess: 'Data loaded successfully',
    loadFailed: 'Failed to load data'
  },
  vi: {
    restoreSuccess: 'Khôi phục thành công',
    restoreFailed: 'Khôi phục thất bại',
    deleteSuccess: 'Xóa thành công',
    deleteFailed: 'Xóa thất bại',
    loadSuccess: 'Tải dữ liệu thành công',
    loadFailed: 'Tải dữ liệu thất bại'
  }
} as const;

export type ToastMessageKey = keyof (typeof toastMessages)['en'];

export const getToastMessages = (language?: Language) =>
  toastMessages[language ?? 'vi'] ?? toastMessages.vi;

export const getToastMessage = (key: ToastMessageKey, language?: Language) =>
  getToastMessages(language)[key];

export const getCurrentLanguageFromStorage = (): Language => {
  if (typeof window === 'undefined') return 'vi';

  const saved = localStorage.getItem('language');
  return saved === 'en' || saved === 'vi' ? saved : 'vi';
};

export const getToastMessageByCurrentLanguage = (key: ToastMessageKey) =>
  getToastMessage(key, getCurrentLanguageFromStorage());
