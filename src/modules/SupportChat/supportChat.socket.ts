import { Server, Socket } from 'socket.io';

type JoinConversationPayload = {
  conversationId: string;
};

const normalizeConversationId = (payload: string | JoinConversationPayload) => {
  if (typeof payload === 'string') {
    return payload;
  }

  return payload.conversationId;
};

export const registerSupportChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('join_conversation', (payload: string | JoinConversationPayload) => {
      const conversationId = normalizeConversationId(payload);

      if (!conversationId) {
        return;
      }

      socket.join(conversationId);
      socket.emit('conversation_joined', { conversationId });
    });
  });
};
