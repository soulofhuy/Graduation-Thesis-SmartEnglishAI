import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';
import {
  DEFAULT_ITEMS_PER_PAGE,
  PaginationParams,
  PaginatedResponse,
  buildPagination
} from '../../../utils/pagination';

class UserManagementService {
  static getAllUsers = async (
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> => {
    try {
      const page = Math.max(params.page || 1, 1);
      const limit = Math.max(params.limit || DEFAULT_ITEMS_PER_PAGE, 1);
      const skip = (page - 1) * limit;

      const [users, totalItems] = await Promise.all([
        prisma.user.findMany({
          where: {
            role: {
              in: [Role.TEACHER, Role.STUDENT]
            }
          },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            deactivatedAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                address: true,
                phoneNumber: true,
                dateOfBirth: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.user.count({
          where: {
            role: {
              in: [Role.TEACHER, Role.STUDENT]
            }
          }
        })
      ]);

      return {
        data: users,
        pagination: buildPagination(page, limit, totalItems)
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };
}

export default UserManagementService;
