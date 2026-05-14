import prisma from '../../../utils/prisma';
import {
  DEFAULT_ITEMS_PER_PAGE,
  PaginationParams,
  PaginatedResponse,
  calculatePaginationValues,
  buildPagination
} from '../../../utils/pagination';

class GetAllClassesService {
  static execute = async (
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> => {
    try {
      const page = Math.max(params.page || 1, 1);
      const limit = Math.max(params.limit || DEFAULT_ITEMS_PER_PAGE, 1);
      const { skip, take } = calculatePaginationValues(page, limit);

      const [classes, totalItems] = await Promise.all([
        prisma.class.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            classCode: true,
            teacherId: true,
            needsTeacherApproval: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            deactivatedAt: true,
            teacher: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            classMembers: {
              select: {
                id: true,
                isApproved: true,
                isBanned: true
              }
            },
            assignments: {
              select: {
                id: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.class.count()
      ]);

      const enrichedClasses = classes.map(cls => ({
        ...cls,
        studentCount: cls.classMembers.length,
        approvedStudentCount: cls.classMembers.filter(m => m.isApproved).length,
        bannedStudentCount: cls.classMembers.filter(m => m.isBanned).length,
        assignmentCount: cls.assignments.length
      }));

      return {
        data: enrichedClasses,
        pagination: buildPagination(page, limit, totalItems)
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch classes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };
}

export default GetAllClassesService;
