import type { Language } from '@/lib/translations';
import { TASK_TYPES, type TaskType } from '@/lib/types';

const TASK_TYPE_LABEL_MAP: Record<Language, Record<TaskType, string>> = {
  en: {
    PRONUNCIATION: 'Pronunciation',
    WORD_STRESS: 'Word stress',
    SITUATIONAL_DIALOG: 'Situational dialog',
    MULTIPLE_CHOICE: 'Multiple choice',
    CLOZE_PASSAGE: 'Cloze passage',
    READING_COMPREHENSION: 'Reading comprehension'
  },
  vi: {
    PRONUNCIATION: 'Phát âm',
    WORD_STRESS: 'Nhấn âm',
    SITUATIONAL_DIALOG: 'Đoạn hội thoại tình huống',
    MULTIPLE_CHOICE: 'Trắc nghiệm ngữ pháp/từ vựng',
    CLOZE_PASSAGE: 'Đoạn văn đục lỗ',
    READING_COMPREHENSION: 'Đọc hiểu đoạn văn'
  }
};

export const getTaskTypeLabel = (
  taskType: TaskType | string,
  language: Language = 'vi'
) => {
  const labels = TASK_TYPE_LABEL_MAP[language] as Record<string, string>;
  return labels[taskType] ?? taskType;
};

export const getTaskTypeOptions = (language: Language = 'vi') => {
  return TASK_TYPES.map(taskType => ({
    value: taskType,
    label: getTaskTypeLabel(taskType, language)
  }));
};
