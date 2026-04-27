import type { Language } from '@/lib/translations';

const EN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const VI_MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12'
];

export const getMonthLabel = (month: string, language: Language = 'vi') => {
  const monthPart = Number(month.split('-')[1] ?? 0);

  if (monthPart < 1 || monthPart > 12) {
    return month;
  }

  return language === 'en'
    ? EN_MONTH_NAMES[monthPart - 1]
    : VI_MONTH_NAMES[monthPart - 1];
};
