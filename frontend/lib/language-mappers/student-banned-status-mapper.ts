import type { Language } from '@/lib/translations';

const EN_BANNED_STATUS_LABELS = {
  true: 'Banned',
  false: 'Joined'
} as const;

const VI_BANNED_STATUS_LABELS = {
  true: 'Bị cấm',
  false: 'Đã tham gia'
} as const;

export const getStudentBannedStatusLabel = (
  isBanned: boolean,
  language: Language = 'vi'
) => {
  return language === 'en'
    ? isBanned
      ? EN_BANNED_STATUS_LABELS.true
      : EN_BANNED_STATUS_LABELS.false
    : isBanned
      ? VI_BANNED_STATUS_LABELS.true
      : VI_BANNED_STATUS_LABELS.false;
};
