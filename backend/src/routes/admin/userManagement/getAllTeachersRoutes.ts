import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetAllTeachersController from '../../../controllers/admin/userManagement/getAllTeachersController';

const router = Router();

router.get(
  '/admin/get-all-teachers',
  verifyJWT,
  GetAllTeachersController.handle
);

export default router;
