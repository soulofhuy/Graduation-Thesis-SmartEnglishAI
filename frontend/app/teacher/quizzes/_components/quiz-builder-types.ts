import type { TaskType } from '@/lib/types';

export interface ChoiceDraft {
  id: string;
  choiceContent: string;
  isCorrect: boolean;
}

export interface QuestionDraft {
  id: string;
  questionContent: string;
  topicTag: string;
  questionType: 'single-choice';
  passageIndex: string;
  choices: ChoiceDraft[];
}

export interface PassageDraft {
  id: string;
  passageContent: string;
}

export interface TaskDraft {
  id: string;
  taskTitle: string;
  taskDescription: string;
  taskType: TaskType;
  passages: PassageDraft[];
  questions: QuestionDraft[];
}

export interface AssignmentFormData {
  title: string;
  description: string;
  classId: string;
  dueDate: string;
  isPublic: boolean;
  isSingleAttempt: boolean;
  canViewResult: boolean;
}
