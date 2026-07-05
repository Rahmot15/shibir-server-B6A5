import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { supportChatAllowedRoles } from './supportChat.constant.js';
import { SupportChatController } from './supportChat.controller.js';
import { SupportChatValidation } from './supportChat.validation.js';

const router = express.Router();

router.post(
  '/conversations',
  auth(...supportChatAllowedRoles),
  validateRequest(SupportChatValidation.openConversationValidationSchema),
  SupportChatController.openConversation
);

router.get(
  '/conversations/my',
  auth(...supportChatAllowedRoles),
  SupportChatController.getMyConversations
);

router.get('/conversations/admin', auth(Role.ADMIN), SupportChatController.getAdminConversations);

router.get(
  '/conversations/:conversationId/messages',
  auth(...supportChatAllowedRoles),
  validateRequest(SupportChatValidation.conversationIdParamValidationSchema),
  SupportChatController.getConversationMessages
);

router.post(
  '/messages',
  auth(...supportChatAllowedRoles),
  validateRequest(SupportChatValidation.sendMessageValidationSchema),
  SupportChatController.sendMessage
);

router.patch(
  '/conversations/:conversationId/seen',
  auth(...supportChatAllowedRoles),
  validateRequest(SupportChatValidation.conversationIdParamValidationSchema),
  SupportChatController.markConversationSeen
);

export const SupportChatRoutes = router;
