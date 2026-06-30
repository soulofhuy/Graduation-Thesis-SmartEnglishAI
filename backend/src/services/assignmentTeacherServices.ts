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
  classIds: string[];
  isPublic?: boolean;
  dueDate?: string;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  tasks: CreateTaskInput[];
};

type UpdateAssignmentInput = {
  title?: string;
  description?: string;
  classIds?: string[];
  dueDate?: string | null;
  isPublic?: boolean;
  isSingleAttempt?: boolean;
  canViewResult?: boolean;
  tasks?: CreateTaskInput[];
};

type UpdateFullAssignmentInput = UpdateAssignmentInput & {
  tasks?: CreateTaskInput[];
  forceDeleteAttempts?: boolean;
};

class AssignmentService {
  private static validateCreatePayload(payload: CreateAssignmentInput) {
    if (!payload.title?.trim()) {
      throw new Error('Assignment title is required');
    }

    if (!Array.isArray(payload.classIds) || payload.classIds.length === 0) {
      throw new Error('At least one class is required');
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

    const [creator, classes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: creatorId },
        select: {
          id: true,
          role: true
        }
      }),
      prisma.class.findMany({
        where: { id: { in: payload.classIds } },
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

    if (classes.length !== payload.classIds.length) {
      throw new Error('One or more classes not found');
    }

    const isAdmin = creator.role === Role.ADMIN;

    for (const classInfo of classes) {
      if (!classInfo.isActive) {
        throw new Error('Cannot create assignment for an inactive class');
      }
      if (creator.role === Role.STUDENT) {
        throw new Error('Students are not allowed to create assignments');
      }
      if (!isAdmin && classInfo.teacherId !== creatorId) {
        throw new Error('Only class owner or admin can create assignment');
      }
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
        createdBy: string;
        isPublic: boolean;
        isSingleAttempt: boolean;
        canViewResult: boolean;
        description?: string | null;
        dueDate?: Date;
      } = {
        title: payload.title.trim(),
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

      await tx.assignmentClass.createMany({
        data: payload.classIds.map(classId => ({
          assignmentId: createdAssignment.id,
          classId
        }))
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

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        assignmentClasses: {
          select: {
            class: {
              select: { id: true, name: true, teacherId: true }
            }
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

    if (!assignment) {
      return null;
    }

    const attemptCount = await prisma.attempt.count({
      where: { assignmentId }
    });

    return {
      ...assignment,
      classes: assignment.assignmentClasses.map(ac => ac.class),
      classIds: assignment.assignmentClasses.map(ac => ac.class.id),
      hasAttempts: attemptCount > 0
    };
  };

  static getChatMessagesByAssignmentId = async (
    teacherId: string,
    assignmentId: string,
    studentId?: string,
    latest = 3
  ) => {
    if (!teacherId?.trim()) {
      throw new Error('Teacher ID is required');
    }

    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const [teacher, assignment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: teacherId },
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
          assignmentClasses: {
            select: {
              class: {
                select: { id: true, teacherId: true, isActive: true }
              }
            }
          }
        }
      })
    ]);

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    if (!teacher.isActive) {
      throw new Error('Teacher account is inactive');
    }

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const assignedClasses3 = assignment.assignmentClasses.map((ac: any) => ac.class);
    if (assignedClasses3.length > 0 && !assignedClasses3.some((c: any) => c.isActive)) {
      throw new Error('Cannot view chat messages of an inactive class');
    }

    const isAdmin = teacher.role === Role.ADMIN;
    const isClassTeacher = assignedClasses3.some((c: any) => c.teacherId === teacherId);
    const isCreator = assignment.createdBy === teacherId;

    if (!isAdmin && !isClassTeacher && !isCreator) {
      throw new Error(
        'Only assignment creator, class owner or admin can view chat messages'
      );
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        assignmentId,
        deletedAt: null,
        ...(studentId?.trim() ? { userId: studentId.trim() } : {})
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        prompts:
          latest > 0
            ? {
                orderBy: { createdAt: 'desc' },
                take: latest,
                include: {
                  parentPrompt: true,
                  response: true
                }
              }
            : {
                orderBy: { createdAt: 'asc' },
                include: {
                  parentPrompt: true,
                  response: true
                }
              }
      }
    });

    // if we fetched only last N prompts per session (desc), reverse each prompts array to ascending order
    const normalized = chatSessions.map(s => ({
      ...s,
      prompts: (s.prompts ?? []).slice().reverse()
    }));

    return {
      assignmentId,
      chatSessions: normalized
    };
  };

  static getOlderPromptsBySessionId = async (
    teacherId: string,
    sessionId: string,
    before?: string,
    limit = 20
  ) => {
    if (!teacherId?.trim()) {
      throw new Error('Teacher ID is required');
    }

    if (!sessionId?.trim()) {
      throw new Error('Session ID is required');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }

    // validate session exists and teacher has access
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        assignment: {
          select: {
            id: true,
            createdBy: true,
            class: { select: { teacherId: true } }
          }
        }
      }
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    if (!session.assignment) {
      throw new Error('Assignment associated with chat session not found');
    }

    const assignmentId = session.assignment.id;

    // reuse permission checks: find teacher role and assignment info
    const [teacher, assignment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, role: true, isActive: true }
      }),
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          id: true,
          createdBy: true,
          assignmentClasses: {
            select: { class: { select: { teacherId: true, isActive: true } } }
          }
        }
      })
    ]);

    if (!teacher) throw new Error('Teacher not found');
    if (!teacher.isActive) throw new Error('Teacher account is inactive');
    if (!assignment) throw new Error('Assignment not found');
    const assignedClasses2 = assignment.assignmentClasses.map((ac: any) => ac.class);
    if (assignedClasses2.length > 0 && !assignedClasses2.some((c: any) => c.isActive))
      throw new Error('Cannot view chat messages of an inactive class');

    const isAdmin = teacher.role === Role.ADMIN;
    const isClassTeacher = assignedClasses2.some((c: any) => c.teacherId === teacherId);
    const isCreator = assignment.createdBy === teacherId;

    if (!isAdmin && !isClassTeacher && !isCreator) {
      throw new Error(
        'Only assignment creator, class owner or admin can view chat messages'
      );
    }

    const where: any = { chatSessionId: sessionId };
    if (before) {
      const beforeDate = new Date(before);
      if (!Number.isNaN(beforeDate.getTime())) {
        where.createdAt = { lt: beforeDate };
      }
    }

    const prompts = await prisma.aIPrompt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { parentPrompt: true, response: true }
    });

    // return in ascending order
    return prompts.slice().reverse();
  };

  static getAssignmentsByClassId = async (classId: string) => {
    if (!classId?.trim()) {
      throw new Error('Class ID is required');
    }

    return prisma.assignment.findMany({
      where: {
        isActive: true,
        assignmentClasses: { some: { classId } }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        assignmentClasses: {
          select: { class: { select: { id: true, name: true, teacherId: true } } }
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
          assignmentClasses: {
            select: { class: { select: { id: true, name: true, teacherId: true } } }
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

  private static areTasksIdentical(payloadTasks: any[], dbTasks: any[]): boolean {
    if (payloadTasks.length !== dbTasks.length) return false;

    for (let i = 0; i < payloadTasks.length; i++) {
      const pTask = payloadTasks[i];
      const dTask = dbTasks[i];

      if ((pTask.taskContent || '').trim() !== (dTask.taskContent || '').trim()) return false;
      if ((pTask.taskType ?? 'MULTIPLE_CHOICE') !== dTask.taskType) return false;

      // Compare passages
      const pPassages = pTask.passages ?? [];
      const dPassages = dTask.passages ?? [];
      if (pPassages.length !== dPassages.length) return false;
      for (let j = 0; j < pPassages.length; j++) {
        if ((pPassages[j].passageContent || '').trim() !== (dPassages[j].passageContent || '').trim()) return false;
      }

      // Compare questions
      const pQuestions = pTask.questions ?? [];
      const dQuestions = dTask.questions ?? [];
      if (pQuestions.length !== dQuestions.length) return false;

      for (let j = 0; j < pQuestions.length; j++) {
        const pQ = pQuestions[j];
        const dQ = dQuestions[j];

        if ((pQ.questionContent || '').trim() !== (dQ.questionContent || '').trim()) return false;

        // Compare passage link
        if (pQ.passageIndex !== undefined && pQ.passageIndex !== null && pQ.passageIndex !== 'none') {
          const passageIdx = Number(pQ.passageIndex);
          const expectedPassageId = dPassages[passageIdx]?.id ?? null;
          if (dQ.passageId !== expectedPassageId) return false;
        } else {
          if (dQ.passageId !== null && dQ.passageId !== undefined) return false;
        }

        // Compare choices
        const pChoices = pQ.choices ?? [];
        const dChoices = dQ.choices ?? [];
        if (pChoices.length !== dChoices.length) return false;

        for (let k = 0; k < pChoices.length; k++) {
          const pC = pChoices[k];
          const dC = dChoices[k];

          if ((pC.choiceContent || '').trim() !== (dC.choiceContent || '').trim()) return false;
          const isDCorrect = dQ.correctChoiceId === dC.id;
          if (Boolean(pC.isCorrect) !== isDCorrect) return false;
        }
      }
    }

    return true;
  }

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
          assignmentClasses: {
            select: {
              class: {
                select: { teacherId: true, isActive: true }
              }
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

    const assignedClasses = existingAssignment.assignmentClasses.map(ac => ac.class);
    const allActive = assignedClasses.length === 0 || assignedClasses.every(c => c.isActive);
    if (!allActive) {
      throw new Error('Cannot update assignment in an inactive class');
    }

    if (updater.role === Role.STUDENT) {
      throw new Error('Students are not allowed to update assignments');
    }

    const isAdmin = updater.role === Role.ADMIN;
    const isClassTeacher = assignedClasses.some(c => c.teacherId === updaterId);
    const isCreator = existingAssignment.createdBy === updaterId;

    if (!isAdmin && !isClassTeacher && !isCreator) {
      throw new Error(
        'Only assignment creator, class owner or admin can update assignment'
      );
    }

    if (
      payload.tasks !== undefined &&
      Array.isArray(payload.tasks) &&
      payload.tasks.length > 0
    ) {
      const attemptCount = await prisma.attempt.count({
        where: { assignmentId }
      });

      if (attemptCount > 0) {
        const fullAssignment = await prisma.assignment.findUnique({
          where: { id: assignmentId },
          include: {
            tasks: {
              orderBy: {
                createdAt: 'asc'
              },
              include: {
                passages: {
                  orderBy: {
                    createdAt: 'asc'
                  }
                },
                questions: {
                  orderBy: {
                    createdAt: 'asc'
                  },
                  include: {
                    choices: {
                      orderBy: {
                        createdAt: 'asc'
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (fullAssignment) {
          const identical = AssignmentService.areTasksIdentical(
            payload.tasks,
            fullAssignment.tasks
          );

          if (identical) {
            delete payload.tasks;
          } else if (payload.forceDeleteAttempts !== true) {
            const err: any = new Error(
              'This assessment already has student attempts. Saving these changes will permanently delete all existing student attempts.'
            );
            err.code = 'ASSESSMENT_HAS_ATTEMPTS';
            throw err;
          }
        }
      }
    }

    if (payload.classIds !== undefined) {
      if (!Array.isArray(payload.classIds) || payload.classIds.length === 0) {
        throw new Error('At least one class is required');
      }

      const targetClasses = await prisma.class.findMany({
        where: { id: { in: payload.classIds } },
        select: {
          id: true,
          teacherId: true,
          isActive: true
        }
      });

      if (targetClasses.length !== payload.classIds.length) {
        throw new Error('One or more classes not found');
      }

      for (const cls of targetClasses) {
        if (!cls.isActive) {
          throw new Error('Cannot assign to an inactive class');
        }
        if (!isAdmin && cls.teacherId !== updaterId) {
          throw new Error('Only class owner or admin can assign to this class');
        }
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
      isSingleAttempt?: boolean;
      canViewResult?: boolean;
    } = {};

    if (normalizedTitle !== undefined) {
      data.title = normalizedTitle;
    }

    if (payload.description !== undefined) {
      data.description = payload.description.trim() || null;
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
        if (payload.forceDeleteAttempts === true) {
          await tx.attempt.deleteMany({
            where: { assignmentId }
          });
        }

        // Update basic assignment fields
        await tx.assignment.update({
          where: { id: assignmentId },
          data
        });

        // Replace class assignments if classIds provided
        if (payload.classIds !== undefined) {
          await tx.assignmentClass.deleteMany({ where: { assignmentId } });
          await tx.assignmentClass.createMany({
            data: payload.classIds.map(classId => ({ assignmentId, classId }))
          });
        }

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

    // If no tasks provided, just update basic fields + classes
    if (Object.keys(data).length === 0 && payload.classIds === undefined) {
      throw new Error('No valid fields provided to update');
    }

    await prisma.$transaction(async tx => {
      if (Object.keys(data).length > 0) {
        await tx.assignment.update({ where: { id: assignmentId }, data });
      }
      if (payload.classIds !== undefined) {
        await tx.assignmentClass.deleteMany({ where: { assignmentId } });
        await tx.assignmentClass.createMany({
          data: payload.classIds.map(classId => ({ assignmentId, classId }))
        });
      }
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
        assignmentClasses: {
          select: { class: { select: { isActive: true } } }
        }
      }
    });

    if (!existingAssignment) {
      throw new Error('Assignment not found');
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
