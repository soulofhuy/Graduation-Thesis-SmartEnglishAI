import prisma from '../utils/prisma';

class ClassStudentService {
  static getAllPendingRequestsToJoinClassByStudent = async (
    studentId: string
  ) => {
    return prisma.classMember.findMany({
      where: {
        studentId,
        isApproved: false,
        isRejected: false
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
