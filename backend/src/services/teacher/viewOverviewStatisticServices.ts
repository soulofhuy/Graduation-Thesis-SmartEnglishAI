import prisma from '../../utils/prisma';
import { AttemptStatus } from '../../generated/prisma/enums';

export interface TeacherOverviewStatistics {
  totalClasses: number;
  totalStudents: number;
  totalPendingStudents: number;
  totalAssignments: number;
}

export interface RecentAssignmentDetail {
  id: string;
  title: string;
  className: string;
  createdAt: Date;
  dueDate: Date | null;
  submittedCount: number;
}

export interface TeacherOverviewResponse {
  statistics: TeacherOverviewStatistics;
  recentAssignments: RecentAssignmentDetail[];
}

export const getTeacherOverviewStatistics = async (
  teacherId: string
): Promise<TeacherOverviewStatistics> => {
  const totalClasses = await prisma.class.count({
    where: {
      teacherId,
      isActive: true
    }
  });

  const teacherClasses = await prisma.class.findMany({
    where: {
      teacherId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  const classIds = teacherClasses.map((cls: { id: string }) => cls.id);

  const totalStudents = await prisma.classMember.count({
    where: {
      classId: {
        in: classIds
      },
      isApproved: true,
      isBanned: false
    }
  });

  const totalPendingStudents = await prisma.classMember.count({
    where: {
      classId: {
        in: classIds
      },
      isApproved: false,
      isRejected: false,
      isBanned: false
    }
  });

  const totalAssignments = await prisma.assignment.count({
    where: {
      createdBy: teacherId,
      isActive: true
    }
  });

  return {
    totalClasses,
    totalStudents,
    totalPendingStudents,
    totalAssignments
  };
};

export const getRecentAssignments = async (
  teacherId: string,
  limit: number = 10
): Promise<RecentAssignmentDetail[]> => {
  const assignments = await prisma.assignment.findMany({
    where: {
      createdBy: teacherId,
      isActive: true
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      dueDate: true,
      class: {
        select: {
          name: true
        }
      },
      attempts: {
        select: {
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  const recentAssignments: RecentAssignmentDetail[] = assignments.map(
    (assignment: any) => {
      const submittedCount = assignment.attempts.filter(
        (attempt: any) => attempt.status === AttemptStatus.SUBMITTED
      ).length;

      return {
        id: assignment.id,
        title: assignment.title,
        className: assignment.class.name || 'Unknown',
        createdAt: assignment.createdAt,
        dueDate: assignment.dueDate,
        submittedCount
      };
    }
  );

  return recentAssignments;
};

export const getTeacherOverview = async (
  teacherId: string
): Promise<TeacherOverviewResponse> => {
  const [statistics, recentAssignments] = await Promise.all([
    getTeacherOverviewStatistics(teacherId),
    getRecentAssignments(teacherId, 10)
  ]);

  return {
    statistics,
    recentAssignments
  };
};
