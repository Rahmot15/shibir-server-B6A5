import { ConversationType } from '@prisma/client';
import { z } from 'zod';
import { supportMessageMaxLength } from './supportChat.constant.js';

const openConversationValidationSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ConversationType),
  }),
});

const conversationIdParamValidationSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation id'),
  }),
});

const sendMessageValidationSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('Invalid conversation id'),
    text: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(supportMessageMaxLength, `Message cannot exceed ${supportMessageMaxLength} characters`),
  }),
});

export const SupportChatValidation = {
  openConversationValidationSchema,
  conversationIdParamValidationSchema,
  sendMessageValidationSchema,
};
