import { Role, AttemptStatus } from '../../generated/prisma/enums';
import prisma from '../../utils/prisma';
import AssignmentStudentService from '../assignmentStudentServices';

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
  assignments: Array<{
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    isSingleAttempt: boolean;
    canViewResult: boolean;
    totalQuestions: number;
    latestAttemptId: string | null;
    latestStatus: AttemptStatus | null;
    latestScore: number | null;
    bestScore: number | null;
    submittedAttemptCount: number;
  }>;
  summary: {
    totalAssignments: number;
    submittedAssignments: number;
    averageScore: number | null;
    highestScore: number | null;
  };
};

class ViewClassProgressOnAssignmentsService {
  private static async ensureActiveTeacher(teacherId: string) {
    if (!teacherId?.trim()) {
      throw new Error('Teacher ID is required');
    }

    const normalizedTeacherId = teacherId.trim();

    const teacher = await prisma.user.findUnique({
      where: { id: normalizedTeacherId },
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
      throw new Error('Only teachers/admin can view class progress');
    }

    return normalizedTeacherId;
  }

  private static async ensureTeacherOwnsClass(
    teacherId: string,
    classId: string
  ) {
    if (!classId?.trim()) {
      throw new Error('Class ID is required');
    }

    const normalizedClassId = classId.trim();

    const classData = await prisma.class.findFirst({
      where: {
        id: normalizedClassId,
        teacherId,
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
    teacherId: string,
    classId: string
  ) => {
    const normalizedTeacherId = await this.ensureActiveTeacher(teacherId);
    const classData = await this.ensureTeacherOwnsClass(
      normalizedTeacherId,
      classId
    );

    const [classMembers, assignments] = await Promise.all([
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
      prisma.assignment.findMany({
        where: {
          classId: classData.id,
          isActive: true
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
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    const studentIds = classMembers.map(member => member.student.id);

    const attempts = studentIds.length
      ? await prisma.attempt.findMany({
          where: {
            studentId: {
              in: studentIds
            },
            assignment: {
              classId: classData.id,
              isActive: true
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

    const attemptsByStudentAndAssignment = new Map<
      string,
      Map<string, ClassAssignmentAttempt[]>
    >();

    attempts.forEach(attempt => {
      const studentMap =
        attemptsByStudentAndAssignment.get(attempt.studentId) ?? new Map();

      const currentAttempts = studentMap.get(attempt.assignmentId) ?? [];
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

      studentMap.set(attempt.assignmentId, currentAttempts);
      attemptsByStudentAndAssignment.set(attempt.studentId, studentMap);
    });

    const students: ClassProgressStudent[] = classMembers.map(member => {
      const studentAssignments = assignments.map(assignment => {
        const totalQuestions = assignment.tasks.reduce((sum, task) => {
          const taskQuestionCount = task._count.questions;
          const passageQuestionCount = task.passages.reduce(
            (passageSum, passage) => passageSum + passage._count.questions,
            0
          );

          return sum + taskQuestionCount + passageQuestionCount;
        }, 0);

        const attemptsForAssignment =
          attemptsByStudentAndAssignment
            .get(member.student.id)
            ?.get(assignment.id) ?? [];

        const submittedAttempts = attemptsForAssignment.filter(
          attempt => attempt.status === AttemptStatus.SUBMITTED
        );

        const scores = submittedAttempts
          .map(attempt => attempt.score)
          .filter((score): score is number => typeof score === 'number');

        const latestAttempt = attemptsForAssignment[0] ?? null;
        const bestScore = scores.length > 0 ? Math.max(...scores) : null;

        return {
          assignmentId: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          isSingleAttempt: assignment.isSingleAttempt,
          canViewResult: assignment.canViewResult,
          totalQuestions,
          latestAttemptId: latestAttempt?.attemptId ?? null,
          latestStatus: latestAttempt?.status ?? null,
          latestScore: latestAttempt?.correctCount ?? null,
          bestScore: submittedAttempts
            .map(attempt => attempt.correctCount)
            .filter((score): score is number => typeof score === 'number')
            .reduce<number | null>(
              (best, correctCount) =>
                best === null || correctCount > best ? correctCount : best,
              null
            ),
          submittedAttemptCount: submittedAttempts.length
        };
      });

      const submittedAssignments = studentAssignments.filter(
        assignment => assignment.submittedAttemptCount > 0
      ).length;

      const allSubmittedScores = studentAssignments
        .map(assignment => assignment.latestScore)
        .filter((score): score is number => typeof score === 'number');

      const highestScore =
        allSubmittedScores.length > 0 ? Math.max(...allSubmittedScores) : null;

      const averageScore =
        allSubmittedScores.length > 0
          ? allSubmittedScores.reduce((sum, score) => sum + score, 0) /
            allSubmittedScores.length
          : null;

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
        assignments: studentAssignments,
        summary: {
          totalAssignments: assignments.length,
          submittedAssignments,
          averageScore,
          highestScore
        }
      };
    });

    return {
      class: classData,
      totalStudents: students.length,
      totalAssignments: assignments.length,
      students
    };
  };

  static getStudentAssignmentProgressDetail = async (
    teacherId: string,
    classId: string,
    studentId: string,
    assignmentId: string
  ) => {
    const normalizedTeacherId = await this.ensureActiveTeacher(teacherId);
    const classData = await this.ensureTeacherOwnsClass(
      normalizedTeacherId,
      classId
    );

    if (!studentId?.trim()) {
      throw new Error('Student ID is required');
    }

    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    const [classMember, assignment] = await Promise.all([
      prisma.classMember.findFirst({
        where: {
          classId: classData.id,
          studentId: studentId.trim(),
          isApproved: true,
          isBanned: false,
          isRejected: false
        },
        select: {
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
        }
      }),
      prisma.assignment.findFirst({
        where: {
          id: assignmentId.trim(),
          classId: classData.id,
          isActive: true
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          isSingleAttempt: true,
          canViewResult: true
        }
      })
    ]);

    if (!classMember) {
      throw new Error('Student not found in class');
    }

    if (!assignment) {
      throw new Error('Assignment not found in class');
    }

    // Reuse the existing student service to fetch full attempt history
    // (ensures consistent result shape and avoids duplication).
    const attemptHistory =
      await AssignmentStudentService.getFullAttemptHistoryOfStudent(
        studentId.trim(),
        assignment.id
      );

    const attempts = attemptHistory.data;

    return {
      class: classData,
      student: {
        studentId: classMember.student.id,
        email: classMember.student.email,
        profile: classMember.student.profile
          ? {
              firstName: classMember.student.profile.firstName ?? null,
              lastName: classMember.student.profile.lastName ?? null,
              phoneNumber: classMember.student.profile.phoneNumber ?? null
            }
          : null
      },
      assignment: {
        assignmentId: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        isSingleAttempt: assignment.isSingleAttempt,
        canViewResult: assignment.canViewResult
      },
      attempts: attempts.map(attempt => ({
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        draftAnswer: attempt.draftAnswer,
        answerCount: attempt._count.answers,
        result: attempt.result,
        answers: attempt.answers.map(answer => ({
          id: answer.id,
          questionId: answer.questionId,
          selectedChoiceId: answer.selectedChoiceId,
          question: answer.question,
          selectedChoice: answer.selectedChoice
        }))
      }))
    };
  };
}

export default ViewClassProgressOnAssignmentsService;
