import { AttemptStatus, Role } from '../../../generated/prisma/enums';
import prisma from '../../../utils/prisma';

type ClassAssignmentAttempt = {
  attemptId: string;
  status: AttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  score: number | null;
  correctCount: number | null;
  totalCount: number | null;
  createdAt: Date | null;
  questionAnswers: unknown | null;
  answerCount: number;
};

type ClassProgressStudent = {
  studentId: string;
  email: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  } | null;
  assignment: {
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    isSingleAttempt: boolean;
    canViewResult: boolean;
    totalQuestions: number;
    latestAttemptId: string | null;
    latestStatus: AttemptStatus | null;
    latestCorrectCount: number | null;
    bestCorrectCount: number | null;
    submittedAttemptCount: number;
  };
};

class GetListOfResultsServices {
  private static async ensureActiveAdmin(adminId: string) {
    if (!adminId?.trim()) {
      throw new Error('Admin ID is required');
    }

    const normalizedAdminId = adminId.trim();

    const admin = await prisma.user.findUnique({
      where: { id: normalizedAdminId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (!admin.isActive) {
      throw new Error('Admin account is inactive');
    }

    if (admin.role !== Role.ADMIN) {
      throw new Error('Only admins can view class progress');
    }

    return normalizedAdminId;
  }

  private static async ensureClassExists(classId: string) {
    if (!classId?.trim()) {
      throw new Error('Class ID is required');
    }

    const normalizedClassId = classId.trim();

    const classData = await prisma.class.findFirst({
      where: {
        id: normalizedClassId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        classCode: true,
        description: true,
        teacherId: true
      }
    });

    if (!classData) {
      throw new Error('Class not found or inaccessible');
    }

    return classData;
  }

  static getClassProgressOnAssignments = async (
    adminId: string,
    classId: string,
    assignmentId: string
  ) => {
    await this.ensureActiveAdmin(adminId);
    const classData = await this.ensureClassExists(classId);

    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const normalizedAssignmentId = assignmentId.trim();

    const [classMembers, assignment] = await Promise.all([
      prisma.classMember.findMany({
        where: {
          classId: classData.id,
          isApproved: true,
          isBanned: false,
          isRejected: false
        },
        select: {
          studentId: true,
          student: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true
                }
              }
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      }),
      prisma.assignment.findFirst({
        where: {
          id: normalizedAssignmentId,
          isActive: true,
          assignmentClasses: { some: { classId: classData.id } }
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          isSingleAttempt: true,
          canViewResult: true,
          tasks: {
            select: {
              _count: {
                select: {
                  questions: true
                }
              },
              passages: {
                select: {
                  _count: {
                    select: {
                      questions: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    if (!assignment) {
      throw new Error('Assignment not found in this class');
    }

    const studentIds = classMembers.map(member => member.student.id);

    const attempts = studentIds.length
      ? await prisma.attempt.findMany({
          where: {
            studentId: {
              in: studentIds
            },
            assignmentId: normalizedAssignmentId,
            assignment: {
              isActive: true,
              assignmentClasses: { some: { classId: classData.id } }
            }
          },
          orderBy: {
            startedAt: 'desc'
          },
          select: {
            id: true,
            studentId: true,
            assignmentId: true,
            status: true,
            submittedAt: true,
            startedAt: true,
            draftAnswer: true,
            result: {
              select: {
                score: true,
                correctCount: true,
                totalCount: true,
                questionAnswers: true,
                createdAt: true
              }
            },
            _count: {
              select: {
                answers: true
              }
            }
          }
        })
      : [];

    const attemptsByStudent = new Map<string, ClassAssignmentAttempt[]>();

    attempts.forEach(attempt => {
      const currentAttempts = attemptsByStudent.get(attempt.studentId) ?? [];
      currentAttempts.push({
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.result?.score ?? null,
        correctCount: attempt.result?.correctCount ?? null,
        totalCount: attempt.result?.totalCount ?? null,
        createdAt: attempt.result?.createdAt ?? null,
        questionAnswers: attempt.result?.questionAnswers ?? null,
        answerCount: attempt._count.answers
      });

      attemptsByStudent.set(attempt.studentId, currentAttempts);
    });

    const totalQuestions = assignment.tasks.reduce((sum, task) => {
      const taskQuestionCount = task._count.questions;
      const passageQuestionCount = task.passages.reduce(
        (passageSum, passage) => passageSum + passage._count.questions,
        0
      );

      return sum + taskQuestionCount + passageQuestionCount;
    }, 0);

    const students: ClassProgressStudent[] = classMembers.map(member => {
      const attemptsForStudent = attemptsByStudent.get(member.student.id) ?? [];

      const submittedAttempts = attemptsForStudent.filter(
        attempt => attempt.status === AttemptStatus.SUBMITTED
      );

      const correctCounts = submittedAttempts
        .map(attempt => attempt.correctCount)
        .filter((count): count is number => typeof count === 'number');

      const latestAttempt = attemptsForStudent[0];
      const latestCorrectCount = latestAttempt?.correctCount ?? null;
      const bestCorrectCount = Math.max(...correctCounts, 0) || null;

      const submittedAttemptCount = submittedAttempts.length;

      return {
        studentId: member.student.id,
        email: member.student.email,
        profile: member.student.profile
          ? {
              firstName: member.student.profile.firstName ?? null,
              lastName: member.student.profile.lastName ?? null,
              phoneNumber: member.student.profile.phoneNumber ?? null
            }
          : null,
        assignment: {
          assignmentId: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          isSingleAttempt: assignment.isSingleAttempt,
          canViewResult: assignment.canViewResult,
          totalQuestions,
          latestAttemptId: latestAttempt?.attemptId ?? null,
          latestStatus: latestAttempt?.status ?? null,
          latestCorrectCount: latestAttempt?.correctCount ?? null,
          bestCorrectCount,
          submittedAttemptCount
        }
      };
    });

    const submittedCount = students.filter(
      student => (student.assignment.submittedAttemptCount ?? 0) > 0
    ).length;
    const notSubmittedCount = students.length - submittedCount;

    let highestCorrectCount = 0;
    let highestCorrectStudentName: string | null = null;

    students.forEach(student => {
      const best = student.assignment.bestCorrectCount ?? 0;
      if (typeof best === 'number' && best > highestCorrectCount) {
        highestCorrectCount = best;
        if (student.profile) {
          highestCorrectStudentName =
            `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim() ||
            student.email;
        } else {
          highestCorrectStudentName = student.email;
        }
      }
    });

    return {
      class: classData,
      assignment: {
        id: assignment.id,
        title: assignment.title
      },
      totalStudents: students.length,
      students,
      assignmentStatistic: {
        submittedCount,
        notSubmittedCount,
        highestCorrectCount,
        highestCorrectStudentName
      }
    };
  };
}

export default GetListOfResultsServices;
