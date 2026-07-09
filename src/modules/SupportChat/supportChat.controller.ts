import { Request, Response } from 'express';
import status from 'http-status';
import { IRequestUser } from '../../interfaces/requestUser.interface.js';
import catchAsync from '../../utils/catchAsync.js';
import { SupportChatService } from './supportChat.service.js';

const openConversation = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.openConversation(req.user as IRequestUser, req.body);

  res.status(status.OK).json({
    success: true,
    message: 'Support conversation opened successfully',
    data: result,
  });
});

const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.getMyConversations(req.user as IRequestUser);

  res.status(status.OK).json({
    success: true,
    message: 'Support conversations fetched successfully',
    data: result,
  });
});

const getAdminConversations = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.getAdminConversations(req.user as IRequestUser);

  res.status(status.OK).json({
    success: true,
    message: 'Support inbox fetched successfully',
    data: result,
  });
});

const getConversationMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.getConversationMessages(
    req.user as IRequestUser,
    req.params.conversationId as string
  );

  res.status(status.OK).json({
    success: true,
    message: 'Support messages fetched successfully',
    data: result,
  });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.sendMessage(req.user as IRequestUser, req.body);

  res.status(status.CREATED).json({
    success: true,
    message: 'Support message sent successfully',
    data: result,
  });
});

const markConversationSeen = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportChatService.markConversationSeen(
    req.user as IRequestUser,
    req.params.conversationId as string
  );

  res.status(status.OK).json({
    success: true,
    message: 'Support conversation marked as seen successfully',
    data: result,
  });
});

export const SupportChatController = {
  openConversation,
  getMyConversations,
  getAdminConversations,
  getConversationMessages,
  sendMessage,
  markConversationSeen,
};
