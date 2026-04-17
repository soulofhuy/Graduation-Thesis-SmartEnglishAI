import type { Language } from '@/lib/translations';

export const assignmentValidationMessages = {
  en: {
    titleRequired: 'Please enter assignment title',
    classIdRequired: 'Please enter class ID',
    dueDateRequired: 'Please enter due date',
    dueDateInvalid: 'Invalid due date format',
    atLeastOneTaskRequired: 'At least one task is required',
    taskContentRequired: 'Task content cannot be empty',
    sharedPassageRequired: 'This task type requires a shared passage',
    atLeastOneQuestionRequired: 'Each task must have at least one question',
    questionContentRequired: 'Question content cannot be empty',
    atLeastTwoChoicesRequired: 'Each question must have at least two choices',
    choiceContentRequired: 'Choice content cannot be empty',
    singleCorrectChoiceRequired:
      'Each question must have exactly one correct choice'
  },
  vi: {
    titleRequired: 'Vui lòng nhập tiêu đề đề thi',
    classIdRequired: 'Vui lòng nhập class ID',
    dueDateRequired: 'Vui lòng nhập hạn nộp',
    dueDateInvalid: 'Định dạng hạn nộp không hợp lệ',
    atLeastOneTaskRequired: 'Cần ít nhất 1 task',
    taskContentRequired: 'Nội dung task không được để trống',
    sharedPassageRequired: 'Task đang chọn cần nhập đoạn văn dùng chung',
    atLeastOneQuestionRequired: 'Mỗi task phải có ít nhất 1 câu hỏi',
    questionContentRequired: 'Nội dung câu hỏi không được để trống',
    atLeastTwoChoicesRequired: 'Mỗi câu hỏi phải có ít nhất 2 đáp án',
    choiceContentRequired: 'Nội dung đáp án không được để trống',
    singleCorrectChoiceRequired: 'Mỗi câu hỏi phải có đúng 1 đáp án đúng'
  }
} as const;

export type AssignmentValidationMessages =
  (typeof assignmentValidationMessages)['en'];

export const getAssignmentValidationMessages = (language?: Language) =>
  assignmentValidationMessages[language ?? 'vi'] ??
  assignmentValidationMessages.vi;
