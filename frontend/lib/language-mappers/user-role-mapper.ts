import type { Language } from '@/lib/translations';

const EN_ROLE_NAMES: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student'
};

const VI_ROLE_NAMES: Record<string, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh'
};

export const getRoleLabel = (role: string, language: Language = 'vi') => {
  if (!role) return role;
  const newRole = role.toLowerCase();

  const key = newRole
    .toString()
    .toLowerCase()
    .replace(/^role[_-]?/, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');

  return language === 'en'
    ? (EN_ROLE_NAMES[key] ?? newRole)
    : (VI_ROLE_NAMES[key] ?? newRole);
};
