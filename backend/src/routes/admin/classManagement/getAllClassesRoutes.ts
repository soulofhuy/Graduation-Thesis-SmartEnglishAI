import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetAllClassesController from '../../../controllers/admin/classManagement/getAllClassesController';

const router = Router();

router.get('/admin/get-all-classes', verifyJWT, GetAllClassesController.handle);

export default router;
