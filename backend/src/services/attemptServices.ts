import { AttemptStatus, Role } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import prisma from '../utils/prisma';

type SubmitAnswerInput = {
  questionId: string;
  selectedChoiceId: string;
};

type SubmitAttemptPayload = {
  attemptId?: string;
  assignmentId: string;
  draftAnswer?: Prisma.InputJsonValue | null;
  answers?: SubmitAnswerInput[];
};

type ResultQuestionAnswerSnapshot = {
  questionId: string;
  questionContent: string;
  taskType: string | null;
  taskContent: string | null;
  passageContent: string | null;
  choiceOptions: {
    choiceId: string;
    choiceContent: string;
    isSelected: boolean;
    isCorrect: boolean;
  }[];
  selectedChoiceId: string;
  selectedChoiceContent: string;
  correctChoiceId: string | null;
  correctChoiceContent: string | null;
  isCorrect: boolean;
};

class AttemptService {
  private static toDraftAnswerValue(value: Prisma.InputJsonValue | null) {
    return value === null ? Prisma.JsonNull : value;
  }

  private static ensureId(value: string, fieldName: string) {
    if (!value?.trim()) {
      throw new Error(`${fieldName} is required`);
    }

    return value.trim();
  }

  private static validateAnswersShape(answers: SubmitAnswerInput[]) {
    if (!Array.isArray(answers)) {
      throw new Error('answers must be an array');
    }

    const seenQuestionIds = new Set<string>();

    answers.forEach((answer, index) => {
      if (!answer?.questionId?.trim()) {
        throw new Error(`questionId is required at answers[${index}]`);
      }

      if (!answer?.selectedChoiceId?.trim()) {
        throw new Error(`selectedChoiceId is required at answers[${index}]`);
      }

      if (seenQuestionIds.has(answer.questionId)) {
        throw new Error(
          `Duplicate questionId found in answers: ${answer.questionId}`
        );
      }

      seenQuestionIds.add(answer.questionId);
    });
  }

  private static async ensureStudentCanAccessAssignment(
    studentId: string,
    assignmentId: string
  ) {
    const [student, assignment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          role: true,
          isActive: true
        }
      }),
      prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          isActive: true,
          class: {
            isActive: true,
            classMembers: {
              some: {
                studentId,
                isApproved: true,
                isBanned: false
              }
            }
          }
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          isSingleAttempt: true
        }
      })
    ]);

    if (!student) {
      throw new Error('Student not found');
    }

    if (!student.isActive) {
      throw new Error('Student account is inactive');
    }

    if (student.role !== Role.STUDENT) {
      throw new Error('Only students can do assignment attempts');
    }

    if (!assignment) {
      throw new Error('Assignment not found or not accessible');
    }

    return assignment;
  }

  private static ensureAssignmentNotExpired(dueDate: Date | null) {
    if (dueDate && dueDate.getTime() < Date.now()) {
      throw new Error('Assignment has expired');
    }
  }

  private static async validateAnswersForAssignment(
    tx: Prisma.TransactionClient,
    assignmentId: string,
    answers: SubmitAnswerInput[]
  ) {
    if (answers.length === 0) {
      return;
    }

    const questionIds = answers.map(answer => answer.questionId);

    const questions = await tx.question.findMany({
      where: {
        id: {
          in: questionIds
        },
        task: {
          assignmentId
        }
      },
      select: {
        id: true,
        choices: {
          select: {
            id: true
          }
        }
      }
    });

    if (questions.length !== questionIds.length) {
      throw new Error('Some questions are invalid or not in this assignment');
    }

    const allowedChoiceIdsByQuestion = new Map<string, Set<string>>();

    questions.forEach(question => {
      allowedChoiceIdsByQuestion.set(
        question.id,
        new Set(question.choices.map(choice => choice.id))
      );
    });

    answers.forEach(answer => {
      const allowedChoices = allowedChoiceIdsByQuestion.get(answer.questionId);

      if (!allowedChoices?.has(answer.selectedChoiceId)) {
        throw new Error(
          `selectedChoiceId ${answer.selectedChoiceId} does not belong to question ${answer.questionId}`
        );
      }
    });
  }

  private static async buildResultQuestionAnswers(
    tx: Prisma.TransactionClient,
    attemptId: string
  ) {
    const submittedAnswers = await tx.answer.findMany({
      where: {
        attemptId
      },
      include: {
        question: {
          select: {
            id: true,
            questionContent: true,
            correctChoiceId: true,
            task: {
              select: {
                taskType: true,
                taskContent: true
              }
            },
            passage: {
              select: {
                passageContent: true
              }
            },
            choices: {
              select: {
                id: true,
                choiceContent: true
              }
            },
            correctChoice: {
              select: {
                id: true,
                choiceContent: true
              }
            }
          }
        },
        selectedChoice: {
          select: {
            id: true,
            choiceContent: true
          }
        }
      }
    });

    return submittedAnswers.map<ResultQuestionAnswerSnapshot>(answer => ({
      questionId: answer.questionId,
      questionContent: answer.question.questionContent,
      taskType: answer.question.task.taskType,
      taskContent: answer.question.task.taskContent,
      passageContent: answer.question.passage?.passageContent ?? null,
      choiceOptions: answer.question.choices.map(choice => ({
        choiceId: choice.id,
        choiceContent: choice.choiceContent,
        isSelected: choice.id === answer.selectedChoiceId,
        isCorrect:
          answer.question.correctChoiceId !== null &&
          choice.id === answer.question.correctChoiceId
      })),
      selectedChoiceId: answer.selectedChoiceId,
      selectedChoiceContent: answer.selectedChoice.choiceContent,
      correctChoiceId: answer.question.correctChoiceId,
      correctChoiceContent:
        answer.question.correctChoice?.choiceContent ?? null,
      isCorrect:
        answer.question.correctChoiceId !== null &&
        answer.selectedChoiceId === answer.question.correctChoiceId
    }));
  }

  private static async ensureSingleAttemptPolicy(
    tx: Prisma.TransactionClient,
    studentId: string,
    assignmentId: string,
    isSingleAttempt: boolean
  ) {
    if (!isSingleAttempt) {
      return;
    }

    const submittedAttempt = await tx.attempt.findFirst({
      where: {
        studentId,
        assignmentId,
        status: AttemptStatus.SUBMITTED
      },
      select: {
        id: true
      }
    });

    if (submittedAttempt) {
      throw new Error('This assignment allows only one submitted attempt');
    }
  }

  static getLatestAttemptForStudent = async (
    studentId: string,
    assignmentId: string
  ) => {
    const normalizedStudentId = this.ensureId(studentId, 'Student ID');
    const normalizedAssignmentId = this.ensureId(assignmentId, 'Assignment ID');

    await this.ensureStudentCanAccessAssignment(
      normalizedStudentId,
      normalizedAssignmentId
    );

    const includeAttemptDetails = {
      answers: {
        include: {
          question: true,
          selectedChoice: true
        }
      },
      result: true
    } as const;

    const latestSubmittedAttempt = await prisma.attempt.findFirst({
      where: {
        studentId: normalizedStudentId,
        assignmentId: normalizedAssignmentId,
        status: AttemptStatus.SUBMITTED
      },
      orderBy: [
        {
          submittedAt: 'desc'
        },
        {
          startedAt: 'desc'
        }
      ],
      include: includeAttemptDetails
    });

    if (latestSubmittedAttempt) {
      return latestSubmittedAttempt;
    }

    return prisma.attempt.findFirst({
      where: {
        studentId: normalizedStudentId,
        assignmentId: normalizedAssignmentId
      },
      orderBy: {
        startedAt: 'desc'
      },
      include: includeAttemptDetails
    });
  };

  static startOrGetInProgressAttempt = async (
    studentId: string,
    assignmentId: string
  ) => {
    const normalizedStudentId = this.ensureId(studentId, 'Student ID');
    const normalizedAssignmentId = this.ensureId(assignmentId, 'Assignment ID');

    const assignment = await this.ensureStudentCanAccessAssignment(
      normalizedStudentId,
      normalizedAssignmentId
    );

    this.ensureAssignmentNotExpired(assignment.dueDate);

    return prisma.$transaction(async tx => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${normalizedStudentId}),
          hashtext(${normalizedAssignmentId})
        )
      `;

      await this.ensureSingleAttemptPolicy(
        tx,
        normalizedStudentId,
        normalizedAssignmentId,
        assignment.isSingleAttempt
      );

      const inProgressAttempts = await tx.attempt.findMany({
        where: {
          studentId: normalizedStudentId,
          assignmentId: normalizedAssignmentId,
          status: AttemptStatus.IN_PROGRESS
        },
        orderBy: {
          startedAt: 'desc'
        },
        include: {
          answers: true
        }
      });

      const inProgressAttempt = inProgressAttempts[0];

      if (inProgressAttempts.length > 1) {
        const staleAttemptIds = inProgressAttempts
          .slice(1)
          .map(attempt => attempt.id);

        await tx.attempt.updateMany({
          where: {
            id: {
              in: staleAttemptIds
            }
          },
          data: {
            status: AttemptStatus.CANCELLED
          }
        });
      }

      if (inProgressAttempt) {
        return inProgressAttempt;
      }

      return tx.attempt.create({
        data: {
          studentId: normalizedStudentId,
          assignmentId: normalizedAssignmentId,
          status: AttemptStatus.IN_PROGRESS
        },
        include: {
          answers: true
        }
      });
    });
  };

  static submitAttempt = async (
    studentId: string,
    payload: SubmitAttemptPayload
  ) => {
    const normalizedStudentId = this.ensureId(studentId, 'Student ID');
    const normalizedAssignmentId = this.ensureId(
      payload.assignmentId,
      'Assignment ID'
    );
    const providedAnswers = payload.answers;

    if (providedAnswers !== undefined) {
      this.validateAnswersShape(providedAnswers);
    }

    const assignment = await this.ensureStudentCanAccessAssignment(
      normalizedStudentId,
      normalizedAssignmentId
    );

    const normalizedAttemptId = payload.attemptId?.trim();

    this.ensureAssignmentNotExpired(assignment.dueDate);

    return prisma.$transaction(async tx => {
      await this.ensureSingleAttemptPolicy(
        tx,
        normalizedStudentId,
        normalizedAssignmentId,
        assignment.isSingleAttempt
      );

      const attempt = normalizedAttemptId
        ? await tx.attempt.findFirst({
            where: {
              id: normalizedAttemptId,
              studentId: normalizedStudentId,
              assignmentId: normalizedAssignmentId
            },
            include: {
              answers: true
            }
          })
        : await tx.attempt.findFirst({
            where: {
              studentId: normalizedStudentId,
              assignmentId: normalizedAssignmentId,
              status: AttemptStatus.IN_PROGRESS
            },
            orderBy: {
              startedAt: 'desc'
            },
            include: {
              answers: true
            }
          });

      if (!attempt) {
        throw new Error(
          'No in-progress attempt found. Please start the assignment before submitting.'
        );
      }

      if (attempt.status !== AttemptStatus.IN_PROGRESS) {
        throw new Error('Attempt is not in progress and cannot be submitted');
      }

      if (providedAnswers !== undefined) {
        await this.validateAnswersForAssignment(
          tx,
          normalizedAssignmentId,
          providedAnswers
        );

        await tx.answer.deleteMany({
          where: {
            attemptId: attempt.id
          }
        });

        if (providedAnswers.length > 0) {
          await tx.answer.createMany({
            data: providedAnswers.map(answer => ({
              attemptId: attempt.id,
              questionId: answer.questionId.trim(),
              selectedChoiceId: answer.selectedChoiceId.trim()
            }))
          });
        }
      }

      const existingAnswerCount = await tx.answer.count({
        where: {
          attemptId: attempt.id
        }
      });

      if (existingAnswerCount === 0) {
        throw new Error('Cannot submit attempt without answers');
      }

      const totalCount = await tx.question.count({
        where: {
          task: {
            assignmentId: normalizedAssignmentId
          }
        }
      });

      const questionAnswers = await this.buildResultQuestionAnswers(
        tx,
        attempt.id
      );
      const correctCount = questionAnswers.filter(
        item => item.isCorrect
      ).length;
      const score =
        totalCount > 0
          ? Number(((correctCount / totalCount) * 100).toFixed(2))
          : 0;

      const updateData: Prisma.AttemptUpdateInput = {
        status: AttemptStatus.SUBMITTED,
        submittedAt: new Date()
      };

      if (payload.draftAnswer !== undefined) {
        updateData.draftAnswer = this.toDraftAnswerValue(payload.draftAnswer);
      }

      await tx.attempt.update({
        where: {
          id: attempt.id
        },
        data: updateData,
        include: {
          answers: {
            include: {
              question: true,
              selectedChoice: true
            }
          }
        }
      });

      await tx.result.upsert({
        where: {
          attemptId: attempt.id
        },
        create: {
          attemptId: attempt.id,
          studentId: normalizedStudentId,
          score,
          correctCount,
          totalCount,
          questionAnswers
        },
        update: {
          studentId: normalizedStudentId,
          score,
          correctCount,
          totalCount,
          questionAnswers
        }
      });

      return tx.attempt.findUnique({
        where: {
          id: attempt.id
        },
        include: {
          answers: {
            include: {
              question: true,
              selectedChoice: true
            }
          },
          result: true
        }
      });
    });
  };
}

export default AttemptService;
