import prisma from '../utils/prisma';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

const DEFAULT_ITEMS_PER_PAGE = MINIMUM_ITEMS_PER_PAGE;

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type PaginatedResult<T> = {
  items: T[];
  pagination: Pagination;
};

function normalizePagination(page?: number, limit?: number) {
  const normalizedPage = Number.isFinite(page ?? NaN)
    ? Math.max(1, page ?? 1)
    : 1;
  const normalizedLimit = Number.isFinite(limit ?? NaN)
    ? Math.min(Math.max(1, limit ?? DEFAULT_ITEMS_PER_PAGE), 100)
    : DEFAULT_ITEMS_PER_PAGE;

  return {
    normalizedPage,
    normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
}

class ClassStudentService {
  static async getAllApprovedClassesByStudent(
    studentId: string,
    page?: number,
    limit?: number
  ) {
    const hasPagination = page !== undefined || limit !== undefined;

    const query = {
      where: {
        isActive: true,
        classMembers: {
          some: {
            studentId,
            isApproved: true,
            isBanned: false
          }
        }
      },
      include: {
        teacher: {
          include: {
            profile: true
          }
        },
        classMembers: {
          where: {
            isApproved: true,
            isBanned: false
          },
          include: {
            student: true
          }
        }
      }
    };

    if (!hasPagination) {
      return prisma.class.findMany(query);
    }

    const { normalizedPage, normalizedLimit, skip } = normalizePagination(
      page,
      limit
    );
    const [items, totalItems] = await prisma.$transaction([
      prisma.class.findMany({
        ...query,
        skip,
        take: normalizedLimit
      }),
      prisma.class.count({ where: query.where })
    ]);

    return {
      items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / normalizedLimit),
        hasNextPage: normalizedPage * normalizedLimit < totalItems,
        hasPrevPage: normalizedPage > 1
      }
    } satisfies PaginatedResult<(typeof items)[number]>;
  }

  static async getAllBannedClassesByStudent(
    studentId: string,
    page?: number,
    limit?: number
  ) {
    const hasPagination = page !== undefined || limit !== undefined;

    const query = {
      where: {
        classMembers: {
          some: {
            studentId,
            isBanned: true
          }
        }
      },
      include: {
        teacher: {
          include: {
            profile: true
          }
        },
        classMembers: {
          where: {
            isBanned: true
          }
        }
      }
    };

    if (!hasPagination) {
      return prisma.class.findMany(query);
    }

    const { normalizedPage, normalizedLimit, skip } = normalizePagination(
      page,
      limit
    );
    const [items, totalItems] = await prisma.$transaction([
      prisma.class.findMany({
        ...query,
        skip,
        take: normalizedLimit
      }),
      prisma.class.count({ where: query.where })
    ]);

    return {
      items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / normalizedLimit),
        hasNextPage: normalizedPage * normalizedLimit < totalItems,
        hasPrevPage: normalizedPage > 1
      }
    } satisfies PaginatedResult<(typeof items)[number]>;
  }

  static async getAllRequestsToJoinClassByStudent(
    studentId: string,
    page?: number,
    limit?: number
  ) {
    const hasPagination = page !== undefined || limit !== undefined;

    const query = {
      where: {
        studentId
      },
      include: {
        class: true,
        student: true
      }
    };

    if (!hasPagination) {
      return prisma.classMember.findMany(query);
    }

    const { normalizedPage, normalizedLimit, skip } = normalizePagination(
      page,
      limit
    );
    const [items, totalItems] = await prisma.$transaction([
      prisma.classMember.findMany({
        ...query,
        skip,
        take: normalizedLimit
      }),
      prisma.classMember.count({ where: query.where })
    ]);

    return {
      items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / normalizedLimit),
        hasNextPage: normalizedPage * normalizedLimit < totalItems,
        hasPrevPage: normalizedPage > 1
      }
    } satisfies PaginatedResult<(typeof items)[number]>;
  }

  static studentJoinClass = async (classCode: string, student: string) => {
    const existingClass = await prisma.class.findUnique({
      where: { classCode }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }
    if (existingClass.needsTeacherApproval) {
      return prisma.classMember.create({
        data: {
          classId: existingClass.id,
          studentId: student
        }
      });
    } else {
      return prisma.classMember.create({
        data: {
          classId: existingClass.id,
          studentId: student,
          approverId: existingClass.teacherId,
          isApproved: true
        }
      });
    }
  };
}

export default ClassStudentService;
