import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';
import generateClassCode from '../../../utils/generate-class-code';

export type CreateAdminClassInput = {
  name?: string | null;
  description?: string | null;
  teacherId: string;
  classCode?: string | null;
  needsTeacherApproval?: boolean;
};

class CreateNewClassServices {
  static execute = async (input: CreateAdminClassInput) => {
    const teacher = await prisma.user.findUnique({
      where: { id: input.teacherId },
      select: {
        id: true,
        role: true
      }
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    if (teacher.role !== Role.TEACHER) {
      throw new Error('Selected user is not a teacher');
    }

    const classCode = await CreateNewClassServices.generateUniqueClassCode(
      input.classCode || undefined
    );

    return prisma.class.create({
      data: {
        name: input.name?.trim() || null,
        description: input.description?.trim() || null,
        teacherId: input.teacherId,
        classCode,
        needsTeacherApproval: input.needsTeacherApproval ?? false
      },
      select: CreateNewClassServices.classSelect()
    });
  };

  private static classSelect = () => ({
    id: true,
    name: true,
    description: true,
    classCode: true,
    teacherId: true,
    needsTeacherApproval: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    deactivatedAt: true,
    teacher: {
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    },
    classMembers: {
      select: {
        id: true,
        isApproved: true,
        isBanned: true
      }
    },
    assignments: {
      select: {
        id: true
      }
    }
  });

  private static generateUniqueClassCode = async (preferredCode?: string) => {
    if (preferredCode) {
      const existing = await prisma.class.findUnique({
        where: { classCode: preferredCode }
      });

      if (existing) {
        throw new Error('Class code already exists');
      }

      return preferredCode;
    }

    while (true) {
      const classCode = generateClassCode();
      const existing = await prisma.class.findUnique({
        where: { classCode }
      });

      if (!existing) {
        return classCode;
      }
    }
  };
}

export default CreateNewClassServices;
