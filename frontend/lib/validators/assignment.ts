import * as z from 'zod';
import type { Language } from '@/lib/translations';
import { getAssignmentValidationMessages } from '../validation-translators/assignment';

const taskTypesRequireSharedPassage: ReadonlySet<string> = new Set([
  'CLOZE_PASSAGE',
  'READING_COMPREHENSION'
] as const);

const taskTypesAllowEmptyQuestionContent: ReadonlySet<string> = new Set([
  'PRONUNCIATION',
  'WORD_STRESS',
  'CLOZE_PASSAGE'
] as const);

export const createAssignmentBasicInfoSchema = (language?: Language) => {
  const messages = getAssignmentValidationMessages(language);

  return z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    classIds: z.array(z.string().trim().min(1)).min(1, messages.classIdRequired),
    description: z.string().optional(),
    dueDate: z
      .string()
      .trim()
      .min(1, messages.dueDateRequired)
      .refine(
        value => !Number.isNaN(new Date(value).getTime()),
        messages.dueDateInvalid
      ),
    isPublic: z.boolean().optional(),
    isSingleAttempt: z.boolean().optional(),
    canViewResult: z.boolean().optional()
  });
};

export const createAssignmentPayloadSchema = (language?: Language) => {
  const messages = getAssignmentValidationMessages(language);

  const schema = z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    classIds: z.array(z.string().trim().min(1)).min(1, messages.classIdRequired),
    description: z.string().optional(),
    dueDate: z
      .string()
      .trim()
      .min(1, messages.dueDateRequired)
      .refine(
        value => !Number.isNaN(new Date(value).getTime()),
        messages.dueDateInvalid
      ),
    isPublic: z.boolean(),
    isSingleAttempt: z.boolean(),
    canViewResult: z.boolean(),
    tasks: z
      .array(
        z.object({
          taskContent: z.string(),
          taskType: z.enum([
            'PRONUNCIATION',
            'WORD_STRESS',
            'SITUATIONAL_DIALOG',
            'MULTIPLE_CHOICE',
            'CLOZE_PASSAGE',
            'READING_COMPREHENSION'
          ]),
          passages: z
            .array(
              z.object({
                passageContent: z.string()
              })
            )
            .optional(),
          questions: z
            .array(
              z.object({
                questionContent: z.string(),
                passageIndex: z.number().optional(),
                choices: z.array(
                  z.object({
                    choiceContent: z.string(),
                    isCorrect: z.boolean()
                  })
                )
              })
            )
            .min(1, messages.atLeastOneQuestionRequired)
        })
      )
      .min(1, messages.atLeastOneTaskRequired)
  });

  return schema.superRefine((assignment, ctx) => {
    assignment.tasks.forEach((task, taskIndex) => {
      if (!task.taskContent.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.taskContentRequired,
          path: ['tasks', taskIndex, 'taskContent']
        });
      }

      if (
        taskTypesRequireSharedPassage.has(task.taskType) &&
        !task.passages?.[0]?.passageContent?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.sharedPassageRequired,
          path: ['tasks', taskIndex, 'passages', 0, 'passageContent']
        });
      }

      task.questions.forEach((question, questionIndex) => {
        const requiresQuestionContent = !taskTypesAllowEmptyQuestionContent.has(
          task.taskType
        );

        if (requiresQuestionContent && !question.questionContent.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messages.questionContentRequired,
            path: [
              'tasks',
              taskIndex,
              'questions',
              questionIndex,
              'questionContent'
            ]
          });
        }

        if (question.choices.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messages.atLeastTwoChoicesRequired,
            path: ['tasks', taskIndex, 'questions', questionIndex, 'choices']
          });
        }

        const correctChoiceCount = question.choices.filter(
          choice => choice.isCorrect
        ).length;

        if (correctChoiceCount !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: messages.singleCorrectChoiceRequired,
            path: ['tasks', taskIndex, 'questions', questionIndex, 'choices']
          });
        }

        question.choices.forEach((choice, choiceIndex) => {
          if (!choice.choiceContent.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: messages.choiceContentRequired,
              path: [
                'tasks',
                taskIndex,
                'questions',
                questionIndex,
                'choices',
                choiceIndex,
                'choiceContent'
              ]
            });
          }
        });
      });
    });
  });
};

export const createAssignmentPreviewSchema = (language?: Language) => {
  const messages = getAssignmentValidationMessages(language);

  return z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    tasks: z.array(z.unknown()).min(1, messages.atLeastOneTaskRequired)
  });
};

export const createAssignmentTaskListSchema = (language?: Language) => {
  const messages = getAssignmentValidationMessages(language);

  return z.array(z.unknown()).min(1, messages.atLeastOneTaskRequired);
};

export const createAssignmentQuestionListSchema = (language?: Language) => {
  const messages = getAssignmentValidationMessages(language);

  return z.array(z.unknown()).min(1, messages.atLeastOneQuestionRequired);
};

export type AssignmentBasicInfoFormValues = z.infer<
  ReturnType<typeof createAssignmentBasicInfoSchema>
>;
