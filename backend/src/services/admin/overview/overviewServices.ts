import prisma from '../../../utils/prisma';
import { AttemptStatus } from '../../../generated/prisma/enums';

export interface OverviewStatisticItem {
  total: number;
  growthRate: number;
}

export interface OverviewStatistics {
  totalUsers: OverviewStatisticItem;
  totalTeachers: OverviewStatisticItem;
  totalStudents: OverviewStatisticItem;
  totalAssignments: OverviewStatisticItem;
}

export interface UserGrowthByMonth {
  month: string;
  teachers: number;
  students: number;
}

export interface AssignmentGrowthByMonth {
  month: string;
  assignments: number;
}

export interface SubmissionGrowthByMonth {
  month: string;
  submissions: number;
  passedSubmissions: number;
}

export interface AdminOverviewResponse {
  year: number;
  statistics: OverviewStatistics;
  userGrowthByMonth: UserGrowthByMonth[];
  assignmentGrowthByMonth: AssignmentGrowthByMonth[];
  submissionGrowthByMonth: SubmissionGrowthByMonth[];
}

type UserGrowthRecord = {
  createdAt: Date | null;
  role: string;
};

type AssignmentGrowthRecord = {
  createdAt: Date;
};

type SubmissionGrowthRecord = {
  submittedAt: Date | null;
  result: {
    correctCount: number;
    totalCount: number;
  } | null;
};

const getMonthStart = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));

const getMonthEnd = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));

const getMonthKey = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const getGrowthRate = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getCurrentYear = () => new Date().getFullYear();

const getYearRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
  end: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0))
});

const buildMonthlyUserGrowth = (
  records: UserGrowthRecord[],
  year: number
): UserGrowthByMonth[] => {
  return Array.from({ length: 12 }, (_, index) => {
    const month = getMonthKey(year, index);

    const monthRecords = records.filter(record => {
      if (!record.createdAt) {
        return false;
      }

      return record.createdAt.getUTCMonth() === index;
    });

    const teachers = monthRecords.filter(
      record => record.role === 'TEACHER'
    ).length;
    const students = monthRecords.filter(
      record => record.role === 'STUDENT'
    ).length;

    return {
      month,
      teachers,
      students
    };
  });
};

const buildMonthlyAssignmentGrowth = (
  records: AssignmentGrowthRecord[],
  year: number
): AssignmentGrowthByMonth[] => {
  return Array.from({ length: 12 }, (_, index) => ({
    month: getMonthKey(year, index),
    assignments: records.filter(
      record => record.createdAt.getUTCMonth() === index
    ).length
  }));
};

const buildMonthlySubmissionGrowth = (
  records: SubmissionGrowthRecord[],
  year: number
): SubmissionGrowthByMonth[] => {
  return Array.from({ length: 12 }, (_, index) => {
    const monthRecords = records.filter(record => {
      if (!record.submittedAt) {
        return false;
      }

      return record.submittedAt.getUTCMonth() === index;
    });

    const submissions = monthRecords.length;
    const passedSubmissions = monthRecords.filter(record => {
      if (!record.result) {
        return false;
      }

      return record.result.correctCount > record.result.totalCount / 2;
    }).length;

    return {
      month: getMonthKey(year, index),
      submissions,
      passedSubmissions
    };
  });
};

const countGrowthWindowUsers = async (
  start: Date,
  end: Date,
  role?: 'TEACHER' | 'STUDENT'
) => {
  return prisma.user.count({
    where: {
      role: role ? role : { in: ['TEACHER', 'STUDENT'] },
      isActive: true,
      createdAt: {
        gte: start,
        lt: end
      }
    }
  });
};

const countGrowthWindowAssignments = async (start: Date, end: Date) => {
  return prisma.assignment.count({
    where: {
      isActive: true,
      createdAt: {
        gte: start,
        lt: end
      }
    }
  });
};

const countGrowthWindowSubmissions = async (start: Date, end: Date) => {
  return prisma.attempt.count({
    where: {
      status: AttemptStatus.SUBMITTED,
      submittedAt: {
        gte: start,
        lt: end
      }
    }
  });
};

export const getAdminOverview = async (
  year = getCurrentYear()
): Promise<AdminOverviewResponse> => {
  const currentDate = new Date();
  const currentYear = currentDate.getUTCFullYear();
  const currentMonthStart = getMonthStart(
    currentYear,
    currentDate.getUTCMonth()
  );
  const currentMonthEnd = getMonthEnd(currentYear, currentDate.getUTCMonth());
  const previousMonthStart = getMonthStart(
    currentDate.getUTCMonth() === 0 ? currentYear - 1 : currentYear,
    currentDate.getUTCMonth() === 0 ? 11 : currentDate.getUTCMonth() - 1
  );
  const previousMonthEnd = currentMonthStart;

  const yearRange = getYearRange(year);

  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalAssignments,
    currentMonthUsers,
    previousMonthUsers,
    currentMonthTeachers,
    previousMonthTeachers,
    currentMonthStudents,
    previousMonthStudents,
    currentMonthAssignments,
    previousMonthAssignments,
    currentMonthSubmissions,
    previousMonthSubmissions,
    usersForYear,
    assignmentsForYear,
    submissionsForYear
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: {
          in: ['TEACHER', 'STUDENT']
        },
        isActive: true
      }
    }),
    prisma.user.count({
      where: {
        role: 'TEACHER',
        isActive: true
      }
    }),
    prisma.user.count({
      where: {
        role: 'STUDENT',
        isActive: true
      }
    }),
    prisma.assignment.count({
      where: {
        isActive: true
      }
    }),
    countGrowthWindowUsers(currentMonthStart, currentMonthEnd),
    countGrowthWindowUsers(previousMonthStart, previousMonthEnd),
    countGrowthWindowUsers(currentMonthStart, currentMonthEnd, 'TEACHER'),
    countGrowthWindowUsers(previousMonthStart, previousMonthEnd, 'TEACHER'),
    countGrowthWindowUsers(currentMonthStart, currentMonthEnd, 'STUDENT'),
    countGrowthWindowUsers(previousMonthStart, previousMonthEnd, 'STUDENT'),
    countGrowthWindowAssignments(currentMonthStart, currentMonthEnd),
    countGrowthWindowAssignments(previousMonthStart, previousMonthEnd),
    countGrowthWindowSubmissions(currentMonthStart, currentMonthEnd),
    countGrowthWindowSubmissions(previousMonthStart, previousMonthEnd),
    prisma.user.findMany({
      where: {
        role: {
          in: ['TEACHER', 'STUDENT']
        },
        isActive: true,
        createdAt: {
          gte: yearRange.start,
          lt: yearRange.end
        }
      },
      select: {
        createdAt: true,
        role: true
      }
    }),
    prisma.assignment.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: yearRange.start,
          lt: yearRange.end
        }
      },
      select: {
        createdAt: true
      }
    }),
    prisma.attempt.findMany({
      where: {
        status: AttemptStatus.SUBMITTED,
        submittedAt: {
          gte: yearRange.start,
          lt: yearRange.end
        }
      },
      select: {
        submittedAt: true,
        result: {
          select: {
            correctCount: true,
            totalCount: true
          }
        }
      }
    })
  ]);

  const userGrowthByMonth = buildMonthlyUserGrowth(usersForYear, year);
  const assignmentGrowthByMonth = buildMonthlyAssignmentGrowth(
    assignmentsForYear,
    year
  );
  const submissionGrowthByMonth = buildMonthlySubmissionGrowth(
    submissionsForYear,
    year
  );

  return {
    year,
    statistics: {
      totalUsers: {
        total: totalUsers,
        growthRate: getGrowthRate(currentMonthUsers, previousMonthUsers)
      },
      totalTeachers: {
        total: totalTeachers,
        growthRate: getGrowthRate(currentMonthTeachers, previousMonthTeachers)
      },
      totalStudents: {
        total: totalStudents,
        growthRate: getGrowthRate(currentMonthStudents, previousMonthStudents)
      },
      totalAssignments: {
        total: totalAssignments,
        growthRate: getGrowthRate(
          currentMonthAssignments,
          previousMonthAssignments
        )
      }
    },
    userGrowthByMonth,
    assignmentGrowthByMonth,
    submissionGrowthByMonth
  };
};
