import { Role } from '../generated/prisma/enums';
import { TaskType } from '../generated/prisma/enums';
import { DEFAULT_ITEMS_PER_PAGE, buildPagination } from '../utils/pagination';
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
  taskType?: TaskType;
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

type UpdateAssignmentInput = {
  title?: string;
  description?: string;
  classId?: string;
  dueDate?: string | null;
  isPublic?: boolean;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  tasks?: CreateTaskInput[];
};

type UpdateFullAssignmentInput = UpdateAssignmentInput & {
  tasks?: CreateTaskInput[];
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
      const taskType = task.taskType ?? TaskType.MULTIPLE_CHOICE;

      if (!task.taskContent?.trim()) {
        throw new Error(`Task content is required at index ${taskIndex}`);
      }

      if (!Array.isArray(task.questions) || task.questions.length === 0) {
        throw new Error(
          `Task at index ${taskIndex} must have at least one question`
        );
      }

      task.questions.forEach((question, questionIndex) => {
        const requiresQuestionContent =
          taskType !== TaskType.PRONUNCIATION &&
          taskType !== TaskType.WORD_STRESS &&
          taskType !== TaskType.CLOZE_PASSAGE;

        if (requiresQuestionContent && !question.questionContent?.trim()) {
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

      if (
        (taskType === TaskType.CLOZE_PASSAGE ||
          taskType === TaskType.READING_COMPREHENSION) &&
        (!task.passages || task.passages.length === 0)
      ) {
        throw new Error(
          `Task at index ${taskIndex} requires at least one passage`
        );
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
            taskContent: task.taskContent.trim(),
            taskType: task.taskType ?? TaskType.MULTIPLE_CHOICE
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

  static getAssignmentsCreatedByTeacher = async (
    teacherId: string,
    page = 1,
    limit = DEFAULT_ITEMS_PER_PAGE
  ) => {
    if (!teacherId?.trim()) {
      throw new Error('Teacher ID is required');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    if (!teacher.isActive) {
      throw new Error('Teacher account is inactive');
    }

    if (teacher.role === Role.STUDENT) {
      throw new Error('Only teacher/admin can have created assignments');
    }

    const where = {
      createdBy: teacherId,
      isActive: true
    };

    const [totalItems, assignments] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              teacherId: true
            }
          },
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
      })
    ]);

    return {
      data: assignments,
      pagination: buildPagination(page, limit, totalItems)
    };
  };

  static updateAssignment = async (
    updaterId: string,
    assignmentId: string,
    payload: UpdateAssignmentInput
  ) => {
    return this.updateAssignmentWithTasks(updaterId, assignmentId, payload);
  };

  static updateAssignmentWithTasks = async (
    updaterId: string,
    assignmentId: string,
    payload: UpdateFullAssignmentInput
  ) => {
    if (!updaterId?.trim()) {
      throw new Error('Updater ID is required');
    }

    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const [updater, existingAssignment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: updaterId },
        select: {
          id: true,
          role: true,
          isActive: true
        }
      }),
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          id: true,
          createdBy: true,
          classId: true,
          class: {
            select: {
              teacherId: true,
              isActive: true
            }
          }
        }
      })
    ]);

    if (!updater) {
      throw new Error('Updater not found');
    }

    if (!updater.isActive) {
      throw new Error('Updater account is inactive');
    }

    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    if (!existingAssignment.class.isActive) {
      throw new Error('Cannot update assignment in an inactive class');
    }

    if (updater.role === Role.STUDENT) {
      throw new Error('Students are not allowed to update assignments');
    }

    const isAdmin = updater.role === Role.ADMIN;
    const isClassTeacher = existingAssignment.class.teacherId === updaterId;
    const isCreator = existingAssignment.createdBy === updaterId;

    if (!isAdmin && !isClassTeacher && !isCreator) {
      throw new Error(
        'Only assignment creator, class owner or admin can update assignment'
      );
    }

    if (payload.classId !== undefined) {
      const normalizedClassId = payload.classId.trim();

      if (!normalizedClassId) {
        throw new Error('Class ID cannot be empty');
      }

      const targetClass = await prisma.class.findUnique({
        where: { id: normalizedClassId },
        select: {
          id: true,
          teacherId: true,
          isActive: true
        }
      });

      if (!targetClass) {
        throw new Error('Class not found');
      }

      if (!targetClass.isActive) {
        throw new Error('Cannot update assignment to an inactive class');
      }

      if (!isAdmin && targetClass.teacherId !== updaterId) {
        throw new Error(
          'Only class owner or admin can move assignment to this class'
        );
      }
    }

    // Prepare update data
    const normalizedTitle =
      payload.title !== undefined ? payload.title.trim() : undefined;

    if (payload.title !== undefined && !normalizedTitle) {
      throw new Error('Assignment title cannot be empty');
    }

    let parsedDueDate: Date | null | undefined;
    if (payload.dueDate !== undefined) {
      if (payload.dueDate === null || payload.dueDate.trim() === '') {
        parsedDueDate = null;
      } else {
        const dueDate = new Date(payload.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
          throw new Error('Invalid dueDate format');
        }
        parsedDueDate = dueDate;
      }
    }

    const data: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      isPublic?: boolean;
      classId?: string;
      isSingleAttempt?: boolean;
      canViewResult?: boolean;
    } = {};

    if (normalizedTitle !== undefined) {
      data.title = normalizedTitle;
    }

    if (payload.description !== undefined) {
      data.description = payload.description.trim() || null;
    }

    if (payload.classId !== undefined) {
      data.classId = payload.classId.trim();
    }

    if (parsedDueDate !== undefined) {
      data.dueDate = parsedDueDate;
    }

    if (payload.isPublic !== undefined) {
      data.isPublic = payload.isPublic;
    }

    if (payload.isSingleAttempt !== undefined) {
      data.isSingleAttempt = payload.isSingleAttempt;
    }

    if (payload.canViewResult !== undefined) {
      data.canViewResult = payload.canViewResult;
    }

    // If tasks are provided, update the entire assignment structure
    if (
      payload.tasks !== undefined &&
      Array.isArray(payload.tasks) &&
      payload.tasks.length > 0
    ) {
      const updatedAssignment = await prisma.$transaction(async tx => {
        // Update basic assignment fields
        await tx.assignment.update({
          where: { id: assignmentId },
          data
        });

        // Delete all existing tasks (cascade delete will handle questions, choices, passages)
        await tx.task.deleteMany({
          where: { assignmentId }
        });

        // Create new tasks with questions, choices, and passages
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const task of payload.tasks!) {
          const createdTask = await tx.task.create({
            data: {
              assignmentId,
              taskContent: task.taskContent.trim(),
              taskType: task.taskType ?? TaskType.MULTIPLE_CHOICE
            }
          });

          const createdPassages: string[] = [];

          if (task.passages?.length) {
            for (const passage of task.passages) {
              const createdPassage = await tx.passage.create({
                data: {
                  taskId: createdTask.id,
                  passageContent: passage.passageContent.trim(),
                  createdBy: updaterId
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
                createdBy: updaterId,
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
          where: { id: assignmentId },
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

      return updatedAssignment;
    }

    // If no tasks provided, just update basic fields
    if (Object.keys(data).length === 0) {
      throw new Error('No valid fields provided to update');
    }

    await prisma.assignment.update({
      where: { id: assignmentId },
      data
    });

    return this.getAssignmentById(assignmentId);
  };

  static toggleAssignmentActiveStatus = async (assignmentId: string) => {
    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        isActive: true
      }
    });

    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isActive: !existingAssignment.isActive,
        deactivatedAt: !existingAssignment.isActive ? null : new Date()
      }
    });
    return updatedAssignment;
  };

  static deleteAssignment = async (assignmentId: string) => {
    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        class: {
          select: {
            isActive: true
          }
        }
      }
    });

    if (!existingAssignment) {
      throw new Error('Assignment not found');
    }

    if (!existingAssignment.class.isActive) {
      throw new Error('Cannot delete assignment from an inactive class');
    }

    await prisma.assignment.delete({
      where: { id: assignmentId }
    });
  };

  static getAllDeactivatedAssignmentsByTeacherId = async (
    teacherId: string
  ) => {
    return prisma.assignment.findMany({
      where: {
        createdBy: teacherId,
        isActive: false
      }
    });
  };
}

export default AssignmentService;
