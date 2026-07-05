import { ConversationType } from '@prisma/client';

export interface IOpenSupportConversationPayload {
  type: ConversationType;
}

export interface ISendSupportMessagePayload {
  conversationId: string;
  text: string;
}
