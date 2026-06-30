import prisma from '../../../utils/prisma';
import {
  DEFAULT_ITEMS_PER_PAGE,
  PaginationParams,
  PaginatedResponse,
  calculatePaginationValues,
  buildPagination
} from '../../../utils/pagination';

class GetAllAssignmentServices {
  static execute = async (
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> => {
    try {
      const page = Math.max(params.page || 1, 1);
      const limit = Math.max(params.limit || DEFAULT_ITEMS_PER_PAGE, 1);
      const { skip, take } = calculatePaginationValues(page, limit);

      const [assignments, totalItems] = await Promise.all([
        prisma.assignment.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            createdBy: true,
            isPublic: true,
            dueDate: true,
            isSingleAttempt: true,
            canViewResult: true,
            isActive: true,
            deactivatedAt: true,
            createdAt: true,
            updatedAt: true,
            creator: {
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
            assignmentClasses: {
              select: {
                class: { select: { id: true, name: true, classCode: true } }
              }
            },
            tasks: {
              select: {
                id: true
              }
            },
            attempts: {
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
        prisma.assignment.count()
      ]);

      const enriched = assignments.map(a => ({
        ...a,
        taskCount: a.tasks.length,
        attemptCount: a.attempts.length,
        teacher: a.creator
          ? {
              id: a.creator.id,
              email: a.creator.email,
              firstName: a.creator.profile?.firstName || null,
              lastName: a.creator.profile?.lastName || null
            }
          : null,
        classes: a.assignmentClasses.map((ac: any) => ac.class),
        classInfo: a.assignmentClasses[0]?.class || null
      }));

      return {
        data: enriched,
        pagination: buildPagination(page, limit, totalItems)
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch assignments: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };
}

export default GetAllAssignmentServices;
