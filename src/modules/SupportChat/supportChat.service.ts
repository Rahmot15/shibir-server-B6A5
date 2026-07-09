import { Prisma, Role, UserStatus } from '@prisma/client';
import status from 'http-status';
import AppError from '../../errors/AppError.js';
import { IRequestUser } from '../../interfaces/requestUser.interface.js';
import { prisma } from '../../lib/prisma.js';
import { emitToConversation } from '../../lib/socket.js';
import {
  IOpenSupportConversationPayload,
  ISendSupportMessagePayload,
} from './supportChat.interface.js';

const supportConversationSelect = {
  id: true,
  userId: true,
  adminId: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  admin: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.SupportConversationSelect;

const supportMessageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  text: true,
  isSeen: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.SupportMessageSelect;

const getSupportAdmin = async () => {
  const activeAdmin = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
    },
  });

  if (activeAdmin) {
    return activeAdmin;
  }

  const fallbackAdmin = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
    },
  });

  if (!fallbackAdmin) {
    throw new AppError('No active support admin found', status.NOT_FOUND);
  }

  return fallbackAdmin;
};

const openConversation = async (user: IRequestUser, payload: IOpenSupportConversationPayload) => {
  const admin = await getSupportAdmin();

  return prisma.supportConversation.upsert({
    where: {
      userId_type: {
        userId: user.id,
        type: payload.type,
      },
    },
    update: {},
    create: {
      userId: user.id,
      adminId: admin.id,
      type: payload.type,
    },
    select: supportConversationSelect,
  });
};

const getConversationOrThrow = async (conversationId: string) => {
  const conversation = await prisma.supportConversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      userId: true,
      adminId: true,
    },
  });

  if (!conversation) {
    throw new AppError('Support conversation not found', status.NOT_FOUND);
  }

  return conversation;
};

const ensureConversationParticipant = async (user: IRequestUser, conversationId: string) => {
  const conversation = await getConversationOrThrow(conversationId);

  const isOwner = conversation.userId === user.id;
  const isAssignedAdmin = conversation.adminId === user.id;
  const isAdmin = user.role === Role.ADMIN;

  if (!isOwner && !isAssignedAdmin && !isAdmin) {
    throw new AppError('You do not have access to this support conversation', status.FORBIDDEN);
  }

  return conversation;
};

const getMyConversations = async (user: IRequestUser) => {
  return prisma.supportConversation.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      ...supportConversationSelect,
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: supportMessageSelect,
      },
      _count: {
        select: {
          messages: {
            where: {
              isSeen: false,
              senderId: {
                not: user.id,
              },
            },
          },
        },
      },
    },
  });
};

const getAdminConversations = async (_user: IRequestUser) => {
  return prisma.supportConversation.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      ...supportConversationSelect,
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: supportMessageSelect,
      },
      _count: {
        select: {
          messages: {
            where: {
              isSeen: false,
              sender: {
                role: {
                  not: Role.ADMIN,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getConversationMessages = async (user: IRequestUser, conversationId: string) => {
  await ensureConversationParticipant(user, conversationId);

  return prisma.supportMessage.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: supportMessageSelect,
  });
};

const sendMessage = async (user: IRequestUser, payload: ISendSupportMessagePayload) => {
  await ensureConversationParticipant(user, payload.conversationId);

  return prisma.$transaction(async (tx) => {
    const message = await tx.supportMessage.create({
      data: {
        conversationId: payload.conversationId,
        senderId: user.id,
        text: payload.text.trim(),
      },
      select: supportMessageSelect,
    });

    await tx.supportConversation.update({
      where: {
        id: payload.conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    emitToConversation(payload.conversationId, 'receive_message', message);

    return message;
  });
};

const markConversationSeen = async (user: IRequestUser, conversationId: string) => {
  await ensureConversationParticipant(user, conversationId);

  const result = await prisma.supportMessage.updateMany({
    where: {
      conversationId,
      isSeen: false,
      senderId: {
        not: user.id,
      },
    },
    data: {
      isSeen: true,
    },
  });

  emitToConversation(conversationId, 'messages_seen', {
    conversationId,
    seenByUserId: user.id,
    count: result.count,
  });

  return result;
};

export const SupportChatService = {
  openConversation,
  getMyConversations,
  getAdminConversations,
  getConversationMessages,
  sendMessage,
  markConversationSeen,
};
