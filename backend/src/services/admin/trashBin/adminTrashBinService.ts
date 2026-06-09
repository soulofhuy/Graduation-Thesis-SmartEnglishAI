import prisma from '../../../utils/prisma';
import ClassTeacherService from '../../classTeacherServices';
import AssignmentService from '../../assignmentTeacherServices';

class AdminTrashBinService {
  static getAllDeactivatedClasses = async () => {
    return prisma.class.findMany({
      where: { isActive: false }
    });
  };

  static getAllDeactivatedAssignments = async () => {
    return prisma.assignment.findMany({
      where: { isActive: false }
    });
  };

  static restoreClass = async (classId: string) => {
    return ClassTeacherService.updateClassStatus(classId);
  };

  static deleteClass = async (classId: string) => {
    return ClassTeacherService.deleteClass(classId);
  };

  static restoreAssignment = async (assignmentId: string) => {
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, isActive: true }
    });

    if (!existingAssignment) throw new Error('Assignment not found');

    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        isActive: true,
        deactivatedAt: null
      }
    });
  };

  static deleteAssignment = async (assignmentId: string) => {
    return prisma.assignment.delete({
      where: { id: assignmentId }
    });
  };
}

export default AdminTrashBinService;
