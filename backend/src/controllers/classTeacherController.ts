import { Request, Response } from 'express';
import ClassTeacherService from '../services/classTeacherServices';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ClassModel } from '../generated/prisma/models/Class';

class ClassTeacherController {
  static createClass = async (req: AuthenticatedRequest, res: Response) => {
    const classData = req.body as ClassModel;

    if (!classData?.teacherId) {
      if (req.userId) {
        classData.teacherId = req.userId;
      } else {
        return res
          .status(400)
          .json(Responses.errorResponse(new Error('Teacher ID is required')));
      }
    }

    try {
      const createdClass = await ClassTeacherService.insertClass(classData);
      return res
        .status(201)
        .json(
          Responses.successResponse('Class created successfully', createdClass)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static updateClassInformation = async (req: Request, res: Response) => {
    const classId = req.params.classId || req.body.classId;
    const updateData = req.body as Partial<ClassModel>;

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const updatedClass = await ClassTeacherService.updateClassInformation(
        classId,
        updateData
      );
      return res
        .status(200)
        .json(
          Responses.successResponse('Class information updated', updatedClass)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getClassById = async (req: Request, res: Response) => {
    const classId = req.params.classId || req.params.id || req.body.classId;

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const classData = await ClassTeacherService.getClassById(classId);

      if (!classData) {
        return res
          .status(404)
          .json(Responses.errorResponse(new Error('Class not found')));
      }

      return res
        .status(200)
        .json(
          Responses.successResponse('Class fetched successfully', classData)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getClassesByTeacherId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.params.teacherId || req.userId || req.body.teacherId;

    if (!teacherId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Teacher ID is required')));
    }

    try {
      const classes =
        await ClassTeacherService.getClassesByTeacherId(teacherId);
      return res
        .status(200)
        .json(
          Responses.successResponse('Classes fetched successfully', classes)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static toggleClassStatus = async (req: Request, res: Response) => {
    const classId = req.params.classId || req.body.classId;

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const updatedClass = await ClassTeacherService.updateClassStatus(classId);
      return res
        .status(200)
        .json(Responses.successResponse('Class status updated', updatedClass));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static generateUniqueClassCode = async (req: Request, res: Response) => {
    try {
      const classCode = await ClassTeacherService.generateUniqueClassCode();
      return res.status(200).json(
        Responses.successResponse('Unique class code generated', {
          classCode
        })
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAllDeactivatedClassesByTeacherId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(
            new Error('Unauthorized - Teacher ID not found')
          )
        );
    }

    try {
      const classes =
        await ClassTeacherService.getAllDeactivatedClassesByTeacherId(
          teacherId
        );
      return res
        .status(200)
        .json(
          Responses.successResponse('Deactivated classes fetched', classes)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static approveStudentJoinClass = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const { classId, studentId } = req.body;
    const approverId = req.userId;

    console.log('Approve student join class request:', {
      classId,
      studentId,
      approverId
    });

    if (!classId || !studentId || !approverId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error('Class ID, Student ID, and Approver ID are required')
          )
        );
    }

    try {
      const updatedClassMember =
        await ClassTeacherService.approveStudentJoinClass(
          classId,
          studentId,
          approverId
        );
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student join request approved',
            updatedClassMember
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ClassTeacherController;
