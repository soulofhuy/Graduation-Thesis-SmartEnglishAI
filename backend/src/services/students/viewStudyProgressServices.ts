import { AttemptStatus, Role, TaskType } from '../../generated/prisma/enums';
import prisma from '../../utils/prisma';

type TaskTypeStat = {
  taskType: TaskType;
  totalQuestions: number;
  correctQuestions: number;
};

class ViewStudyProgressService {
  private static async ensureActiveStudent(studentId: string) {
    if (!studentId?.trim()) {
      throw new Error('Student ID is required');
    }

    const normalizedStudentId = studentId.trim();

    const student = await prisma.user.findUnique({
      where: { id: normalizedStudentId },
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
      throw new Error('Only students can view study progress');
    }

    return normalizedStudentId;
  }

  static getStudyProgress = async (studentId: string) => {
    const normalizedStudentId = await this.ensureActiveStudent(studentId);
    const currentYear = new Date().getUTCFullYear();

    const submittedAttempts = await prisma.attempt.findMany({
      where: {
        studentId: normalizedStudentId,
        status: AttemptStatus.SUBMITTED
      },
      orderBy: {
        submittedAt: 'asc'
      },
      select: {
        id: true,
        assignmentId: true,
        submittedAt: true,
        result: {
          select: {
            totalCount: true,
            correctCount: true
          }
        },
        answers: {
          select: {
            selectedChoiceId: true,
            question: {
              select: {
                correctChoiceId: true,
                task: {
                  select: {
                    taskType: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const uniqueAssignmentIds = new Set<string>();
    let totalQuestionsDone = 0;

    const monthlyMap = new Map<
      string,
      {
        month: string;
        totalQuestions: number;
        correctQuestions: number;
      }
    >();

    for (let monthIndex = 1; monthIndex <= 12; monthIndex += 1) {
      const month = `${currentYear}-${String(monthIndex).padStart(2, '0')}`;

      monthlyMap.set(month, {
        month,
        totalQuestions: 0,
        correctQuestions: 0
      });
    }

    const taskTypeMap = new Map<TaskType, TaskTypeStat>();

    Object.values(TaskType).forEach(taskType => {
      taskTypeMap.set(taskType, {
        taskType,
        totalQuestions: 0,
        correctQuestions: 0
      });
    });

    submittedAttempts.forEach(attempt => {
      uniqueAssignmentIds.add(attempt.assignmentId);

      if (attempt.result) {
        totalQuestionsDone += attempt.result.totalCount;
      }

      if (attempt.submittedAt) {
        const submittedYear = attempt.submittedAt.getUTCFullYear();

        if (submittedYear === currentYear) {
          const month = `${submittedYear}-${String(
            attempt.submittedAt.getUTCMonth() + 1
          ).padStart(2, '0')}`;

          const currentMonthStat = monthlyMap.get(month);

          if (currentMonthStat) {
            currentMonthStat.totalQuestions += attempt.result?.totalCount ?? 0;
            currentMonthStat.correctQuestions +=
              attempt.result?.correctCount ?? 0;

            monthlyMap.set(month, currentMonthStat);
          }
        }
      }

      attempt.answers.forEach(answer => {
        const taskType = answer.question.task.taskType;

        const taskTypeStat = taskTypeMap.get(taskType) ?? {
          taskType,
          totalQuestions: 0,
          correctQuestions: 0
        };

        taskTypeStat.totalQuestions += 1;

        if (
          answer.question.correctChoiceId !== null &&
          answer.selectedChoiceId === answer.question.correctChoiceId
        ) {
          taskTypeStat.correctQuestions += 1;
        }

        taskTypeMap.set(taskType, taskTypeStat);
      });
    });

    const taskTypeStats = Array.from(taskTypeMap.values());

    const bestTaskType = taskTypeStats.reduce<TaskTypeStat | null>(
      (best, stat) => {
        if (!best || stat.correctQuestions > best.correctQuestions) {
          return stat;
        }

        return best;
      },
      null
    );

    const weakestTaskType = taskTypeStats.reduce<TaskTypeStat | null>(
      (weakest, stat) => {
        if (!weakest || stat.correctQuestions < weakest.correctQuestions) {
          return stat;
        }

        return weakest;
      },
      null
    );

    const monthlyCorrectByTime = Array.from(monthlyMap.values());

    return {
      overview: {
        totalAssignmentsDone: uniqueAssignmentIds.size,
        totalQuestionsDone,
        bestTaskType,
        weakestTaskType
      },
      monthlyCorrectByTime,
      taskTypeStats
    };
  };
}

export default ViewStudyProgressService;
