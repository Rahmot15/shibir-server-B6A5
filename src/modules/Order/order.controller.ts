import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { OrderService } from './order.service.js';

const checkout = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.checkout(user.id, req.body);
  res.status(status.OK).json({
    success: true,
    message: 'Order placed successfully',
    data: result,
  });
});

const getOrders = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.getOrders(user.id, req.query as any);
  res.status(status.OK).json({
    success: true,
    message: 'Orders fetched successfully',
    data: result.orders,
    meta: result.meta,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await OrderService.getOrderById(user.id, req.params.id as string);
  if (!result) {
    res.status(status.NOT_FOUND).json({
      success: false,
      message: 'Order not found',
    });
    return;
  }
  res.status(status.OK).json({
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

export const OrderController = {
  checkout,
  getOrders,
  getOrderById,
};
