import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';
import { MINIMUM_ITEMS_PER_PAGE } from '@/utils/constants';

const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

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

      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      return {
        data: users,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page * limit < totalItems,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };
}

export default UserManagementService;
