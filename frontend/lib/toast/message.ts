import type { Language } from '@/lib/translations';

export const toastMessages = {
  en: {
    invalidToken: 'Please log in again to continue',
    restoreSuccess: 'Restore successful',
    restoreFailed: 'Restore failed',
    deleteSuccess: 'Delete successful',
    deleteFailed: 'Delete failed',
    loadSuccess: 'Data loaded successfully',
    loadFailed: 'Failed to load data',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    signUpSuccess: 'Sign up successful',
    signUpFailed: 'Sign up failed',
    saveSuccess: 'Save successful',
    saveFailed: 'Save failed',
    changePasswordSuccess: 'Change password successful',
    changePasswordFailed: 'Change password failed',
    copySuccess: 'Copy successful',
    classCodeRequired: 'Please enter the class code',
    submitAssignmentSuccess: 'Assignment submitted successfully',
    submitAssignmentFailed: 'Failed to submit assignment'
  },
  vi: {
    invalidToken: 'Hãy đăng nhập lại để tiếp tục',
    restoreSuccess: 'Khôi phục thành công',
    restoreFailed: 'Khôi phục thất bại',
    deleteSuccess: 'Xóa thành công',
    deleteFailed: 'Xóa thất bại',
    loadSuccess: 'Tải dữ liệu thành công',
    loadFailed: 'Tải dữ liệu thất bại',
    loginSuccess: 'Đăng nhập thành công',
    loginFailed: 'Đăng nhập thất bại',
    signUpSuccess: 'Đăng ký thành công',
    signUpFailed: 'Đăng ký thất bại',
    saveSuccess: 'Lưu thành công',
    saveFailed: 'Lưu thất bại',
    changePasswordSuccess: 'Đổi mật khẩu thành công',
    changePasswordFailed: 'Đổi mật khẩu thất bại',
    copySuccess: 'Sao chép thành công',
    classCodeRequired: 'Vui lòng nhập mã lớp học',
    submitAssignmentSuccess: 'Nộp bài tập thành công',
    submitAssignmentFailed: 'Nộp bài tập thất bại'
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
