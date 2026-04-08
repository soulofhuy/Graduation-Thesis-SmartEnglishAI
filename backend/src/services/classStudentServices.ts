import prisma from '../utils/prisma';

class ClassStudentService {
  static getAllApprovedClassesByStudent = async (studentId: string) => {
    return prisma.class.findMany({
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
    });
  };

  static getAllBannedClassesByStudent = async (studentId: string) => {
    return prisma.class.findMany({
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
        }
      }
    });
  };

  static getAllRequestsToJoinClassByStudent = async (studentId: string) => {
    return prisma.classMember.findMany({
      where: {
        studentId
      },
      include: {
        class: true,
        student: true
      }
    });
  };

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
