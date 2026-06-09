import { Router } from 'express';
import AdminTrashBinController from '../../../controllers/admin/trashBin/adminTrashBinController';
import verifyJWT from '../../../middlewares/authMiddleware';

const router = Router();

router.get('/trash/classes', verifyJWT, AdminTrashBinController.getAllDeactivatedClasses);
router.get('/trash/assignments', verifyJWT, AdminTrashBinController.getAllDeactivatedAssignments);
router.patch('/trash/classes/:classId/restore', verifyJWT, AdminTrashBinController.restoreClass);
router.delete('/trash/classes/:classId/delete', verifyJWT, AdminTrashBinController.deleteClass);
router.patch('/trash/assignments/:assignmentId/restore', verifyJWT, AdminTrashBinController.restoreAssignment);
router.delete('/trash/assignments/:assignmentId/delete', verifyJWT, AdminTrashBinController.deleteAssignment);

export default router;
