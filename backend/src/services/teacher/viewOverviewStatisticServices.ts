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
  totalStudentsInClass: number;
  submittedCount: number;
  submittedStudentsCount: number;
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
      assignmentClasses: {
        select: {
          class: {
            select: { id: true, name: true }
          }
        }
      },
      attempts: {
        select: {
          status: true,
          studentId: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  // Get unique class IDs across all assignments (multi-class support)
  const classIds = [...new Set(
    assignments.flatMap((a: any) => a.assignmentClasses.map((ac: any) => ac.class.id))
  )];

  // Query total students in each class (approved and not banned)
  const classStudentCounts = classIds.length
    ? await prisma.classMember.groupBy({
        by: ['classId'],
        where: {
          classId: { in: classIds },
          isApproved: true,
          isBanned: false
        },
        _count: true
      })
    : [];

  // Create a map for quick lookup
  const studentCountMap = new Map(
    classStudentCounts.map((item: any) => [item.classId, item._count])
  );

  const recentAssignments: RecentAssignmentDetail[] = assignments.map(
    (assignment: any) => {
      const submittedAttempts = assignment.attempts.filter(
        (attempt: any) => attempt.status === AttemptStatus.SUBMITTED
      );

      const submittedCount = submittedAttempts.length;

      const submittedStudentIds = new Set(
        submittedAttempts.map((attempt: any) => attempt.studentId)
      );
      const submittedStudentsCount = submittedStudentIds.size;

      const primaryClass = assignment.assignmentClasses[0]?.class;
      const primaryClassId = primaryClass?.id;

      return {
        id: assignment.id,
        title: assignment.title,
        className: primaryClass?.name || 'Unknown',
        createdAt: assignment.createdAt,
        dueDate: assignment.dueDate,
        totalStudentsInClass: primaryClassId ? (studentCountMap.get(primaryClassId) || 0) : 0,
        submittedCount,
        submittedStudentsCount
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
