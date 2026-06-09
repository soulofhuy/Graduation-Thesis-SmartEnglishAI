import { Request, Response } from 'express';
import AdminTrashBinService from '../../../services/admin/trashBin/adminTrashBinService';
import Responses from '../../../utils/responses';

class AdminTrashBinController {
  static getAllDeactivatedClasses = async (req: Request, res: Response) => {
    try {
      const classes = await AdminTrashBinService.getAllDeactivatedClasses();
      return res.status(200).json(
        Responses.successResponse('Deactivated classes fetched', classes)
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAllDeactivatedAssignments = async (req: Request, res: Response) => {
    try {
      const assignments = await AdminTrashBinService.getAllDeactivatedAssignments();
      return res.status(200).json(
        Responses.successResponse('Deactivated assignments fetched', assignments)
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static restoreClass = async (req: Request, res: Response) => {
    const classId = req.params.classId;
    if (!classId) {
      return res.status(400).json(Responses.errorResponse(new Error('Class ID is required')));
    }
    try {
      const updatedClass = await AdminTrashBinService.restoreClass(classId);
      return res.status(200).json(
        Responses.successResponse('Class restored successfully', updatedClass)
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static deleteClass = async (req: Request, res: Response) => {
    const classId = req.params.classId;
    if (!classId) {
      return res.status(400).json(Responses.errorResponse(new Error('Class ID is required')));
    }
    try {
      await AdminTrashBinService.deleteClass(classId);
      return res.status(200).json(
        Responses.successResponse('Class deleted successfully')
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static restoreAssignment = async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId;
    if (!assignmentId) {
      return res.status(400).json(Responses.errorResponse(new Error('Assignment ID is required')));
    }
    try {
      const updatedAssignment = await AdminTrashBinService.restoreAssignment(assignmentId);
      return res.status(200).json(
        Responses.successResponse('Assignment restored successfully', updatedAssignment)
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static deleteAssignment = async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId;
    if (!assignmentId) {
      return res.status(400).json(Responses.errorResponse(new Error('Assignment ID is required')));
    }
    try {
      await AdminTrashBinService.deleteAssignment(assignmentId);
      return res.status(200).json(
        Responses.successResponse('Assignment deleted successfully')
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AdminTrashBinController;
