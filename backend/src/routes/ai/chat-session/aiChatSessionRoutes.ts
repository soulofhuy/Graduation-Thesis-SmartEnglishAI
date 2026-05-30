import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import AIChatSessionController from '@/controllers/ai/chat-session/aiChatSessionController';

const router = Router();

router.post(
  '/ai/chat-session/message',
  verifyJWT,
  AIChatSessionController.sendMessage
);
router.get(
  '/ai/chat-session/assignment/:assignmentId',
  verifyJWT,
  AIChatSessionController.getChatSessionsByAssignmentId
);
router.get(
  '/ai/chat-session/:chatSessionId',
  verifyJWT,
  AIChatSessionController.getChatSessionById
);
router.get(
  '/ai/chat-session/:chatSessionId/messages',
  verifyJWT,
  AIChatSessionController.getChatSessionMessagesById
);
router.patch(
  '/ai/chat-session/:chatSessionId/assignment',
  verifyJWT,
  AIChatSessionController.linkChatSessionToAssignment
);

export default router;
