import prisma from '../utils/prisma';

class ClassStudentService {
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
