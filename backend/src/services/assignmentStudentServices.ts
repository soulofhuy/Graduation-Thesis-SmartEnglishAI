import { AttemptStatus, Role } from '../generated/prisma/enums';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';
import prisma from '../utils/prisma';

const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

class AssignmentStudentService {
  static getAssignmentsAssignedToStudentClasses = async (
    studentId: string,
    page = 1,
    limit = DEFAULT_ITEMS_PER_PAGE
  ) => {
    if (!studentId?.trim()) {
      throw new Error('Student ID is required');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (!student.isActive) {
      throw new Error('Student account is inactive');
    }

    if (student.role !== Role.STUDENT) {
      throw new Error('Only students can view assignments assigned to classes');
    }

    const where = {
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
              classCode: true,
              teacherId: true
            }
          },
          creator: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: true
            }
          },
          _count: {
            select: {
              tasks: true
            }
          },
          attempts: {
            where: {
              studentId
            },
            orderBy: {
              startedAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              status: true,
              startedAt: true,
              submittedAt: true,
              result: {
                select: {
                  correctCount: true,
                  totalCount: true,
                  score: true
                }
              }
            }
          }
        }
      })
    ]);

    const assignmentsWithAttemptStatus = assignments.map(assignment => {
      const latestAttempt = assignment.attempts[0];

      let attemptSummary: {
        status: AttemptStatus;
        label: 'DONE' | 'IN_PROGRESS';
        correctCount?: number;
        totalCount?: number;
        score?: number;
        attemptId: string;
        startedAt: Date;
        submittedAt: Date | null;
      } | null = null;

      if (latestAttempt?.status === AttemptStatus.SUBMITTED) {
        attemptSummary = {
          status: AttemptStatus.SUBMITTED,
          label: 'DONE',
          attemptId: latestAttempt.id,
          startedAt: latestAttempt.startedAt,
          submittedAt: latestAttempt.submittedAt,
          ...(latestAttempt.result?.correctCount !== undefined
            ? { correctCount: latestAttempt.result.correctCount }
            : {}),
          ...(latestAttempt.result?.totalCount !== undefined
            ? { totalCount: latestAttempt.result.totalCount }
            : {}),
          ...(latestAttempt.result?.score !== undefined
            ? { score: latestAttempt.result.score }
            : {})
        };
      }

      if (latestAttempt?.status === AttemptStatus.IN_PROGRESS) {
        attemptSummary = {
          status: AttemptStatus.IN_PROGRESS,
          label: 'IN_PROGRESS',
          attemptId: latestAttempt.id,
          startedAt: latestAttempt.startedAt,
          submittedAt: latestAttempt.submittedAt
        };
      }

      const { attempts, ...assignmentWithoutAttempts } = assignment;

      return {
        ...assignmentWithoutAttempts,
        attemptSummary
      };
    });

    return {
      data: assignmentsWithAttemptStatus,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1
      }
    };
  };

  static getAssignmentByIdForStudentToDoTest = async (assignmentId: string) => {
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
                    choices: true
                  }
                }
              }
            },
            questions: {
              orderBy: {
                createdAt: 'asc'
              },
              include: {
                choices: true
              }
            }
          }
        }
      }
    });
  };

  static getAssignmentsHistoryOfStudent = async (
    studentId: string,
    page = 1,
    limit = DEFAULT_ITEMS_PER_PAGE
  ) => {
    if (!studentId?.trim()) {
      throw new Error('Student ID is required');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (!student.isActive) {
      throw new Error('Student account is inactive');
    }

    if (student.role !== Role.STUDENT) {
      throw new Error('Only students can view assignments assigned to classes');
    }

    const where = {
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
              classCode: true,
              teacherId: true
            }
          },
          creator: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: true
            }
          },
          _count: {
            select: {
              tasks: true
            }
          },
          attempts: {
            where: {
              studentId
            },
            orderBy: {
              startedAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              status: true,
              startedAt: true,
              submittedAt: true,
              result: {
                select: {
                  correctCount: true,
                  totalCount: true,
                  score: true
                }
              }
            }
          }
        }
      })
    ]);

    const assignmentsWithAttemptStatus = assignments.map(assignment => {
      const latestAttempt = assignment.attempts[0];

      let attemptSummary: {
        status: AttemptStatus;
        label: 'DONE' | 'IN_PROGRESS';
        correctCount?: number;
        totalCount?: number;
        score?: number;
        attemptId: string;
        startedAt: Date;
        submittedAt: Date | null;
      } | null = null;

      if (latestAttempt?.status === AttemptStatus.SUBMITTED) {
        attemptSummary = {
          status: AttemptStatus.SUBMITTED,
          label: 'DONE',
          attemptId: latestAttempt.id,
          startedAt: latestAttempt.startedAt,
          submittedAt: latestAttempt.submittedAt,
          ...(latestAttempt.result?.correctCount !== undefined
            ? { correctCount: latestAttempt.result.correctCount }
            : {}),
          ...(latestAttempt.result?.totalCount !== undefined
            ? { totalCount: latestAttempt.result.totalCount }
            : {}),
          ...(latestAttempt.result?.score !== undefined
            ? { score: latestAttempt.result.score }
            : {})
        };
      }

      if (latestAttempt?.status === AttemptStatus.IN_PROGRESS) {
        attemptSummary = {
          status: AttemptStatus.IN_PROGRESS,
          label: 'IN_PROGRESS',
          attemptId: latestAttempt.id,
          startedAt: latestAttempt.startedAt,
          submittedAt: latestAttempt.submittedAt
        };
      }

      const { attempts, ...assignmentWithoutAttempts } = assignment;

      return {
        ...assignmentWithoutAttempts,
        attemptSummary
      };
    });

    return {
      data: assignmentsWithAttemptStatus,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1
      }
    };
  };
}

export default AssignmentStudentService;
