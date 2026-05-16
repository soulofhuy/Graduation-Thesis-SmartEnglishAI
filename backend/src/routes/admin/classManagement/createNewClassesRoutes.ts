import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import CreateNewClassesController from '../../../controllers/admin/classManagement/createNewClassesController';

const router = Router();

router.post(
  '/admin/create-class',
  verifyJWT,
  CreateNewClassesController.handle
);

export default router;
