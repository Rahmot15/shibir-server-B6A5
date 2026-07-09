import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { envVars } from '../config/env.js';
import { registerSupportChatSocket } from '../modules/SupportChat/supportChat.socket.js';

let socketServer: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer) => {
  if (socketServer) {
    return socketServer;
  }

  socketServer = new SocketIOServer(httpServer, {
    cors: {
      origin: envVars.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  registerSupportChatSocket(socketServer);

  return socketServer;
};

export const getSocketServer = () => {
  if (!socketServer) {
    throw new Error('Socket server has not been initialized yet');
  }

  return socketServer;
};

export const closeSocketServer = async () => {
  if (!socketServer) {
    return;
  }

  await socketServer.close();
  socketServer = null;
};

export const emitToConversation = <TPayload>(conversationId: string, eventName: string, payload: TPayload) => {
  getSocketServer().to(conversationId).emit(eventName, payload);
};
