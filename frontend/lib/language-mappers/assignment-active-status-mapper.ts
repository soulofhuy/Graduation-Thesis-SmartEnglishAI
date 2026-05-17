import type { Language } from '@/lib/translations';

const EN_STATUS_LABELS = {
  true: 'Active',
  false: 'Inactive'
} as const;

const VI_STATUS_LABELS = {
  true: 'Đang mở',
  false: 'Đang đóng'
} as const;

export const getAssignmentActiveStatusLabel = (
  isActive: boolean,
  language: Language = 'vi'
) => {
  return language === 'en'
    ? isActive
      ? EN_STATUS_LABELS.true
      : EN_STATUS_LABELS.false
    : isActive
      ? VI_STATUS_LABELS.true
      : VI_STATUS_LABELS.false;
};
