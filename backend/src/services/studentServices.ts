import prisma from '../utils/prisma';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

class StudentService {
  static async getBannedStudentsByClassId(
    classId: string,
    page = 1,
    limit = DEFAULT_ITEMS_PER_PAGE
  ) {
    const normalizedPage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const normalizedLimit = Number.isFinite(limit)
      ? Math.min(Math.max(1, limit), 100)
      : DEFAULT_ITEMS_PER_PAGE;
    const skip = (normalizedPage - 1) * normalizedLimit;

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        description: true,
        teacherId: true,
        classCode: true,
        needsTeacherApproval: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deactivatedAt: true
      }
    });

    if (!classInfo) {
      throw new Error('Class not found');
    }

    const whereClause = {
      classId,
      isApproved: true,
      isBanned: true
    };

    const [classMembers, totalItems] = await prisma.$transaction([
      prisma.classMember.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              profile: true
            }
          }
        },
        orderBy: {
          bannedAt: 'asc'
        },
        skip,
        take: normalizedLimit
      }),
      prisma.classMember.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalItems / normalizedLimit);

    return {
      ...classInfo,
      classMembers,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totalItems,
        totalPages,
        hasNextPage: normalizedPage < totalPages,
        hasPrevPage: normalizedPage > 1
      }
    };
  }

  static async toggleBanStudentInClass(classId: string, studentId: string) {
    const classMember = await prisma.classMember.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId
        }
      }
    });

    if (!classMember) {
      throw new Error('Class member not found');
    }
    const isCurrentlyBanned = classMember.isBanned;

    const updatedMember = await prisma.classMember.update({
      where: {
        classId_studentId: {
          classId,
          studentId
        }
      },
      data: {
        isBanned: !isCurrentlyBanned,
        bannedAt: !isCurrentlyBanned ? new Date() : null
      }
    });

    return updatedMember;
  }
}

export default StudentService;
