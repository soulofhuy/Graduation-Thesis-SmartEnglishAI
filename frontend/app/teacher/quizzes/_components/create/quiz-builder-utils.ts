import type { TaskType } from '@/lib/types';
import type { CreateAssignmentInput } from '@/lib/types/create-test-input';
import type {
  AssignmentFormData,
  ChoiceDraft,
  QuestionDraft,
  TaskDraft
} from './quiz-builder-types';

export const createId = () => Math.random().toString(36).slice(2, 10);

export const safeTrim = (value?: string | null) =>
  typeof value === 'string' ? value.trim() : '';

export const createChoice = (): ChoiceDraft => ({
  id: createId(),
  choiceContent: '',
  isCorrect: false
});

export const createQuestion = (): QuestionDraft => ({
  id: createId(),
  questionContent: '',
  topicTag: '',
  passageIndex: 'none',
  choices: [createChoice(), createChoice()]
});

export const createTask = (
  taskType: TaskType,
  taskTitle: string
): TaskDraft => ({
  id: createId(),
  taskTitle,
  taskDescription: '',
  taskType,
  passages: [],
  questions: [createQuestion()]
});

export const buildCreateAssignmentPayload = (
  formData: AssignmentFormData,
  tasks: TaskDraft[]
): CreateAssignmentInput => ({
  title: safeTrim(formData.title),
  description: safeTrim(formData.description) || undefined,
  classId: safeTrim(formData.classId),
  isPublic: formData.isPublic,
  dueDate: formData.dueDate
    ? new Date(formData.dueDate).toISOString()
    : undefined,
  isSingleAttempt: formData.isSingleAttempt,
  canViewResult: formData.canViewResult,
  tasks: tasks.map(task => ({
    taskContent: safeTrim(task.taskDescription) || safeTrim(task.taskTitle),
    taskType: task.taskType,
    passages: task.passages.length
      ? task.taskType === 'CLOZE_PASSAGE' ||
        task.taskType === 'READING_COMPREHENSION'
        ? [{ passageContent: safeTrim(task.passages[0]?.passageContent) }]
        : task.passages.map(passage => ({
            passageContent: safeTrim(passage.passageContent)
          }))
      : undefined,
    questions: task.questions.map(question => ({
      questionContent: safeTrim(question.questionContent),
      passageIndex:
        task.taskType === 'CLOZE_PASSAGE' ||
        task.taskType === 'READING_COMPREHENSION'
          ? 0
          : question.passageIndex === 'none'
            ? undefined
            : Number(question.passageIndex),
      choices: question.choices.map(choice => ({
        choiceContent: safeTrim(choice.choiceContent),
        isCorrect: choice.isCorrect
      }))
    }))
  }))
});
