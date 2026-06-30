import { Role } from '../../../generated/prisma/enums';
import prisma from '../../../utils/prisma';
import AssignmentStudentService from '../../assignmentStudentServices';

class GetResultDetailsServices {
  private static async ensureActiveAdmin(adminId: string) {
    if (!adminId?.trim()) {
      throw new Error('Admin ID is required');
    }

    const normalizedAdminId = adminId.trim();

    const admin = await prisma.user.findUnique({
      where: { id: normalizedAdminId },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    if (!admin.isActive) {
      throw new Error('Admin account is inactive');
    }

    if (admin.role !== Role.ADMIN) {
      throw new Error('Only admins can view student result details');
    }

    return normalizedAdminId;
  }

  static getStudentAssignmentProgressDetail = async (
    adminId: string,
    assignmentId: string,
    studentId: string
  ) => {
    await this.ensureActiveAdmin(adminId);

    if (!assignmentId?.trim()) {
      throw new Error('Assignment ID is required');
    }

    if (!studentId?.trim()) {
      throw new Error('Student ID is required');
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId.trim(),
        isActive: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        isSingleAttempt: true,
        canViewResult: true,
        assignmentClasses: {
          select: { class: { select: { id: true, name: true, classCode: true, teacherId: true } } }
        }
      }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Use the first class for backwards-compat (admin detail view)
    const primaryClassId = assignment.assignmentClasses[0]?.class?.id ?? '';

    const [classData, classMember] = await Promise.all([
      primaryClassId ? prisma.class.findFirst({
        where: {
          id: primaryClassId,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          classCode: true,
          teacherId: true
        }
      }) : Promise.resolve(null),
      primaryClassId ? prisma.classMember.findFirst({
        where: {
          classId: primaryClassId,
          studentId: studentId.trim(),
          isApproved: true,
          isBanned: false,
          isRejected: false
        },
        select: {
          student: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true
                }
              }
            }
          }
        }
      }) : Promise.resolve(null)
    ]);

    if (!classData) {
      throw new Error('Class not found');
    }

    if (!classMember) {
      throw new Error('Student not found in class');
    }

    const attemptHistory =
      await AssignmentStudentService.getFullAttemptHistoryOfStudent(
        studentId.trim(),
        assignment.id
      );

    return {
      class: classData,
      student: {
        studentId: classMember.student.id,
        email: classMember.student.email,
        profile: classMember.student.profile
          ? {
              firstName: classMember.student.profile.firstName ?? null,
              lastName: classMember.student.profile.lastName ?? null,
              phoneNumber: classMember.student.profile.phoneNumber ?? null
            }
          : null
      },
      assignment: {
        assignmentId: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        isSingleAttempt: assignment.isSingleAttempt,
        canViewResult: assignment.canViewResult
      },
      attempts: attemptHistory.data.map(attempt => ({
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        draftAnswer: attempt.draftAnswer,
        answerCount: attempt._count.answers,
        result: attempt.result,
        answers: attempt.answers.map(answer => ({
          id: answer.id,
          questionId: answer.questionId,
          selectedChoiceId: answer.selectedChoiceId,
          question: answer.question,
          selectedChoice: answer.selectedChoice
        }))
      }))
    };
  };
}

export default GetResultDetailsServices;
