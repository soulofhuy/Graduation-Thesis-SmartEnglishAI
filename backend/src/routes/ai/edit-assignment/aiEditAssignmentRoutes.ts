import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import AIEditAssignmentController from '@/controllers/ai/edit-assignment/aiEditAssignmentController';

const router = Router();

router.post('/ai/edit-assignment', verifyJWT, AIEditAssignmentController.editAssignment);

export default router;
