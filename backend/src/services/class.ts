import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';
import prisma from '../utils/prisma';

const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

class ClassService {
  static getStudentsByClassId = async (
    classId: string,
    page = 1,
    limit = DEFAULT_ITEMS_PER_PAGE
  ) => {
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
      isBanned: false
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
          approvedAt: 'asc'
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
  };
}

export default ClassService;
