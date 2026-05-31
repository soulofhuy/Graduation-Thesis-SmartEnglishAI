import type { Language } from '@/lib/translations';

const EN_STUDENT_REQUEST_JOIN_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

const VI_STUDENT_REQUEST_JOIN_STATUS_LABELS: Record<string, string> = {
  pending: 'Đang chờ',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối'
};

export const getStudentRequestJoinStatusLabel = (status: string, language: Language = 'vi') => {
  if (!status) return status;
  return language === 'en'
    ? (EN_STUDENT_REQUEST_JOIN_STATUS_LABELS[status] ?? status)
    : (VI_STUDENT_REQUEST_JOIN_STATUS_LABELS[status] ?? status);
};
