import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import CreateNewClassServices, {
  CreateAdminClassInput
} from '../../../services/admin/classManagement/createNewClassServices';

class CreateNewClassesController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, teacherId, classCode, needsTeacherApproval } =
      req.body as Partial<CreateAdminClassInput>;

    if (!teacherId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Teacher ID is required')));
    }

    try {
      const createdClass = await CreateNewClassServices.execute({
        teacherId,
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(classCode !== undefined ? { classCode } : {}),
        ...(needsTeacherApproval !== undefined ? { needsTeacherApproval } : {})
      });

      return res
        .status(201)
        .json(
          Responses.successResponse('Class created successfully', createdClass)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default CreateNewClassesController;
