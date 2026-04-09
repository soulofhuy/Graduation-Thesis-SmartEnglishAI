import prisma from '../utils/prisma';
import { ClassModel } from '../generated/prisma/models/Class';
import generateClassCode from '../utils/generate-class-code';

class ClassTeacherService {
  static insertClass = async (classData: ClassModel) => {
    classData.classCode = classData.classCode || generateClassCode();
    return prisma.class.create({
      data: classData
    });
  };

  static updateClassInformation = async (
    classId: string,
    updateData: Partial<ClassModel>
  ) => {
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }
    return prisma.class.update({
      where: { id: classId },
      data: updateData
    });
  };

  static getClassById = async (classId: string) => {
    return prisma.class.findUnique({
      where: { id: classId }
    });
  };

  static getClassesByTeacherId = async (
    teacherId: string,
    includePending = false
  ) => {
    const classes = await prisma.class.findMany({
      where: { teacherId, isActive: true },
      include: {
        classMembers: {
          include: {
            student: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    return classes.map(cls => {
      const pendingMembers = cls.classMembers.filter(
        cm => !cm.isApproved && !cm.isRejected && !cm.isBanned
      );
      const approvedMembers = cls.classMembers.filter(
        cm => cm.isApproved && !cm.isBanned
      );

      return {
        ...cls,
        classMembers: includePending ? cls.classMembers : approvedMembers,
        pendingStudentsList: pendingMembers,
        approvedStudentsCount: approvedMembers.length
      };
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
      data: {
        isActive: !existingClass.isActive,
        updatedAt: new Date(),
        deactivatedAt: !existingClass.isActive ? null : new Date()
      }
    });
  };

  static generateUniqueClassCode = async () => {
    let classCode = generateClassCode();
    let isUnique = false;
    while (!isUnique) {
      const existingClass = await prisma.class.findUnique({
        where: { classCode }
      });
      if (!existingClass) {
        isUnique = true;
      }
    }
    return classCode;
  };

  static getAllDeactivatedClassesByTeacherId = async (teacherId: string) => {
    return prisma.class.findMany({
      where: { teacherId, isActive: false }
    });
  };

  static approveStudentJoinClass = async (
    classId: string,
    studentId: string,
    approverId: string
  ) => {
    const approver = await prisma.user.findUnique({
      where: { id: approverId }
    });

    if (!approver) {
      throw new Error('Approver not found');
    }
    if (approver.role === 'STUDENT') {
      throw new Error('Only teachers/admin can approve student join class');
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }

    return prisma.classMember.update({
      where: {
        classId_studentId: {
          classId,
          studentId
        }
      },
      data: {
        isApproved: true,
        approverId,
        approvedAt: new Date()
      }
    });
  };

  static rejectStudentJoinClass = async (
    classId: string,
    studentId: string,
    rejectorId: string
  ) => {
    const rejector = await prisma.user.findUnique({
      where: { id: rejectorId }
    });

    if (!rejector) {
      throw new Error('Rejector not found');
    }
    if (rejector.role === 'STUDENT') {
      throw new Error('Only teachers/admin can reject student join class');
    }

    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    if (!existingClass) {
      throw new Error('Class not found');
    }

    return prisma.classMember.update({
      where: {
        classId_studentId: {
          classId,
          studentId
        }
      },
      data: {
        isRejected: true,
        rejectorId,
        rejectedAt: new Date()
      }
    });
  };
}

export default ClassTeacherService;
