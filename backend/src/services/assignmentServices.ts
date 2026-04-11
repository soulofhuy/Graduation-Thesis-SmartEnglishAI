import { Role } from '../generated/prisma/enums';
import prisma from '../utils/prisma';

type CreateChoiceInput = {
  choiceContent: string;
  isCorrect: boolean;
};

type CreateQuestionInput = {
  questionContent: string;
  passageIndex?: number;
  choices: CreateChoiceInput[];
};

type CreatePassageInput = {
  passageContent: string;
};

type CreateTaskInput = {
  taskContent: string;
  passages?: CreatePassageInput[];
  questions: CreateQuestionInput[];
};

type CreateAssignmentInput = {
  title: string;
  description?: string;
  classId: string;
  isPublic?: boolean;
  dueDate?: string;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  tasks: CreateTaskInput[];
};

class AssignmentService {
  private static validateCreatePayload(payload: CreateAssignmentInput) {
    if (!payload.title?.trim()) {
      throw new Error('Assignment title is required');
    }

    if (!payload.classId?.trim()) {
      throw new Error('Class ID is required');
    }

    if (!Array.isArray(payload.tasks) || payload.tasks.length === 0) {
      throw new Error('Assignment must have at least one task');
    }

    payload.tasks.forEach((task, taskIndex) => {
      if (!task.taskContent?.trim()) {
        throw new Error(`Task content is required at index ${taskIndex}`);
      }

      if (!Array.isArray(task.questions) || task.questions.length === 0) {
        throw new Error(
          `Task at index ${taskIndex} must have at least one question`
        );
      }

      task.questions.forEach((question, questionIndex) => {
        if (!question.questionContent?.trim()) {
          throw new Error(
            `Question content is required at task ${taskIndex}, question ${questionIndex}`
          );
        }

        if (
          question.passageIndex !== undefined &&
          (!Number.isInteger(question.passageIndex) ||
            question.passageIndex < 0)
        ) {
          throw new Error(
            `passageIndex must be a non-negative integer at task ${taskIndex}, question ${questionIndex}`
          );
        }

        if (
          question.passageIndex !== undefined &&
          (!task.passages || question.passageIndex >= task.passages.length)
        ) {
          throw new Error(
            `Invalid passageIndex at task ${taskIndex}, question ${questionIndex}`
          );
        }

        if (!Array.isArray(question.choices) || question.choices.length < 2) {
          throw new Error(
            `Question at task ${taskIndex}, question ${questionIndex} must have at least two choices`
          );
        }

        const correctChoiceCount = question.choices.filter(
          choice => choice.isCorrect
        ).length;

        if (correctChoiceCount !== 1) {
          throw new Error(
            `Question at task ${taskIndex}, question ${questionIndex} must have exactly one correct choice`
          );
        }

        question.choices.forEach((choice, choiceIndex) => {
          if (!choice.choiceContent?.trim()) {
            throw new Error(
              `Choice content is required at task ${taskIndex}, question ${questionIndex}, choice ${choiceIndex}`
            );
          }
        });
      });

      if (task.passages) {
        task.passages.forEach((passage, passageIndex) => {
          if (!passage.passageContent?.trim()) {
            throw new Error(
              `Passage content is required at task ${taskIndex}, passage ${passageIndex}`
            );
          }
        });
      }
    });
  }

  static createAssignmentWithTasks = async (
    creatorId: string,
    payload: CreateAssignmentInput
  ) => {
    this.validateCreatePayload(payload);

    const [creator, classInfo] = await Promise.all([
      prisma.user.findUnique({
        where: { id: creatorId },
        select: {
          id: true,
          role: true
        }
      }),
      prisma.class.findUnique({
        where: { id: payload.classId },
        select: {
          id: true,
          teacherId: true,
          isActive: true
        }
      })
    ]);

    if (!creator) {
      throw new Error('Creator not found');
    }

    if (!classInfo) {
      throw new Error('Class not found');
    }

    if (!classInfo.isActive) {
      throw new Error('Cannot create assignment for an inactive class');
    }

    if (creator.role === Role.STUDENT) {
      throw new Error('Students are not allowed to create assignments');
    }

    const isAdmin = creator.role === Role.ADMIN;
    if (!isAdmin && classInfo.teacherId !== creatorId) {
      throw new Error('Only class owner or admin can create assignment');
    }

    let parsedDueDate: Date | undefined;
    if (payload.dueDate) {
      parsedDueDate = new Date(payload.dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        throw new Error('Invalid dueDate format');
      }
    }

    const assignment = await prisma.$transaction(async tx => {
      const assignmentData: {
        title: string;
        classId: string;
        createdBy: string;
        isPublic: boolean;
        isSingleAttempt: boolean;
        canViewResult: boolean;
        description?: string | null;
        dueDate?: Date;
      } = {
        title: payload.title.trim(),
        classId: payload.classId,
        createdBy: creatorId,
        isPublic: payload.isPublic ?? false,
        isSingleAttempt: payload.isSingleAttempt ?? false,
        canViewResult: payload.canViewResult ?? true
      };

      if (payload.description !== undefined) {
        assignmentData.description = payload.description.trim() || null;
      }

      if (parsedDueDate) {
        assignmentData.dueDate = parsedDueDate;
      }

      const createdAssignment = await tx.assignment.create({
        data: assignmentData
      });

      for (const task of payload.tasks) {
        const createdTask = await tx.task.create({
          data: {
            assignmentId: createdAssignment.id,
            taskContent: task.taskContent.trim()
          }
        });

        const createdPassages: string[] = [];

        if (task.passages?.length) {
          for (const passage of task.passages) {
            const createdPassage = await tx.passage.create({
              data: {
                taskId: createdTask.id,
                passageContent: passage.passageContent.trim(),
                createdBy: creatorId
              }
            });
            createdPassages.push(createdPassage.id);
          }
        }

        for (const question of task.questions) {
          const mappedPassageId =
            question.passageIndex !== undefined
              ? (createdPassages[question.passageIndex] ?? null)
              : null;

          const createdQuestion = await tx.question.create({
            data: {
              taskId: createdTask.id,
              questionContent: question.questionContent.trim(),
              createdBy: creatorId,
              passageId: mappedPassageId
            }
          });

          let correctChoiceId = '';

          for (const choice of question.choices) {
            const createdChoice = await tx.choice.create({
              data: {
                questionId: createdQuestion.id,
                choiceContent: choice.choiceContent.trim()
              }
            });

            if (choice.isCorrect) {
              correctChoiceId = createdChoice.id;
            }
          }

          await tx.question.update({
            where: { id: createdQuestion.id },
            data: {
              correctChoiceId
            }
          });
        }
      }

      return tx.assignment.findUnique({
        where: { id: createdAssignment.id },
        include: {
          tasks: {
            include: {
              passages: {
                include: {
                  questions: {
                    include: {
                      choices: true,
                      correctChoice: true
                    }
                  },
                  choices: true
                }
              },
              questions: {
                include: {
                  choices: true,
                  correctChoice: true
                }
              }
            }
          }
        }
      });
    });

    return assignment;
  };

  static getAssignmentById = async (assignmentId: string) => {
    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    return prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true
          }
        },
        tasks: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            passages: {
              orderBy: {
                createdAt: 'asc'
              },
              include: {
                questions: {
                  include: {
                    choices: true,
                    correctChoice: true
                  }
                }
              }
            },
            questions: {
              orderBy: {
                createdAt: 'asc'
              },
              include: {
                choices: true,
                correctChoice: true
              }
            }
          }
        }
      }
    });
  };

  static getAssignmentsByClassId = async (classId: string) => {
    if (!classId?.trim()) {
      throw new Error('Class ID is required');
    }

    return prisma.assignment.findMany({
      where: {
        classId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        tasks: {
          include: {
            passages: {
              include: {
                questions: {
                  include: {
                    choices: true,
                    correctChoice: true
                  }
                }
              }
            },
            questions: {
              include: {
                choices: true,
                correctChoice: true
              }
            }
          }
        }
      }
    });
  };
}

export default AssignmentService;
