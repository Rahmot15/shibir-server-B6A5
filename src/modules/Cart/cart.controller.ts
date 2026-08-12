import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { CartService } from './cart.service.js';

const getCart = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.getCart(user.id);
  res.status(status.OK).json({
    success: true,
    message: 'Cart fetched successfully',
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.addToCart(user.id, req.body.issueId, req.body.quantity);
  res.status(status.OK).json({
    success: true,
    message: 'Item added to cart',
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.updateCartItem(user.id, req.params.itemId as string, req.body.quantity);
  res.status(status.OK).json({
    success: true,
    message: 'Cart item updated',
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CartService.removeCartItem(user.id, req.params.itemId as string);
  res.status(status.OK).json({
    success: true,
    message: 'Item removed from cart',
    data: result,
  });
});

export const CartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
