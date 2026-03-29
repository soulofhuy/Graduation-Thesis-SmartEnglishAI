import prisma from '../utils/prisma';
import { ClassModel } from '../generated/prisma/models/Class';
import generateClassCode from '../utils/generate-class-code';

class ClassService {
  static insertClass = async (classData: ClassModel) => {
    classData.classCode = classData.classCode || generateClassCode();
    return prisma.class.create({
      data: classData
    });
  };

  static updateNeedTeacherApprovalStatus = async (classId: string) => {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }
    return prisma.class.update({
      where: { id: classId },
      data: { needsTeacherApproval: !existingClass.needsTeacherApproval }
    });
  };

  static getClassById = async (classId: string) => {
    return prisma.class.findUnique({
      where: { id: classId }
    });
  };

  static getClassesByTeacherId = async (teacherId: string) => {
    return prisma.class.findMany({
      where: { teacherId }
    });
  };

  static updateClassStatus = async (classId: string) => {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }
    return prisma.class.update({
      where: { id: classId },
      data: { isActive: !existingClass.isActive }
    });
  };
}

export default ClassService;
