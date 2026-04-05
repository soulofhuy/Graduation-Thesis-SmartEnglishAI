import prisma from '../utils/prisma';
import { ClassModel } from '../generated/prisma/models/Class';
import generateClassCode from '../utils/generate-class-code';

class ClassService {
  static getStudentsByClassId = async (classId: string) => {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }

    const classMembers = await prisma.classMember.findMany({
      where: {
        classId,
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
    });

    return classMembers;
  };
}

export default ClassService;
