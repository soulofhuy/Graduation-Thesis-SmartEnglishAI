import prisma from '../utils/prisma';

class ClassService {
  static getStudentsByClassId = async (classId: string) => {
    const classWithMembers = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classMembers: {
          where: {
            isApproved: true,
            isBanned: false
          },
          include: {
            student: {
              include: {
                profile: true
              }
            }
          },
          orderBy: {
            approvedAt: 'asc'
          }
        }
      }
    });

    if (!classWithMembers) {
      throw new Error('Class not found');
    }

    return classWithMembers;
  };
}

export default ClassService;
