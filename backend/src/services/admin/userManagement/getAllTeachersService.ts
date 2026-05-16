import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';

class GetAllTeachersService {
  static execute = async () => {
    try {
      const teachers = await prisma.user.findMany({
        where: {
          role: Role.TEACHER
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
        }
      });

      return teachers;
    } catch (error) {
      throw new Error(
        `Failed to fetch teachers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };
}

export default GetAllTeachersService;
