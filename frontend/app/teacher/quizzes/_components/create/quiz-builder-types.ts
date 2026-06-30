import type {
  CreateChoiceInput,
  CreatePassageInput,
  CreateTaskInput
} from '@/lib/types/create-test-input';

export interface ChoiceDraft {
  id: string;
  choiceContent: CreateChoiceInput['choiceContent'];
  isCorrect: CreateChoiceInput['isCorrect'];
}

export interface QuestionDraft {
  id: string;
  questionContent: string;
  topicTag: string;
  passageIndex: string;
  choices: ChoiceDraft[];
}

export interface PassageDraft {
  id: string;
  passageContent: CreatePassageInput['passageContent'];
}

export interface TaskDraft {
  id: string;
  taskTitle: string;
  taskDescription: string;
  taskType: CreateTaskInput['taskType'];
  passages: PassageDraft[];
  questions: QuestionDraft[];
}

export interface AssignmentFormData {
  title: string;
  description: string;
  classIds: string[];
  dueDate: string;
  isPublic: boolean;
  isSingleAttempt: boolean;
  canViewResult: boolean;
}
