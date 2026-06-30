import type { TaskType } from './index';

export interface CreateChoiceInput {
  choiceContent: string;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  questionContent: string;
  passageIndex?: number;
  choices: CreateChoiceInput[];
}

export interface CreatePassageInput {
  passageContent: string;
}

export interface CreateTaskInput {
  taskContent: string;
  taskType: TaskType;
  passages?: CreatePassageInput[];
  questions: CreateQuestionInput[];
}

export interface CreateAssignmentInput {
  title: string;
  description?: string;
  classIds: string[];
  isPublic: boolean;
  dueDate?: string;
  isSingleAttempt: boolean;
  canViewResult: boolean;
  tasks: CreateTaskInput[];
}
