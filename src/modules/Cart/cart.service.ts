import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

const getCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          issue: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              finalPrice: true,
              price: true,
              currency: true,
              stock: true,
              isAvailable: true,
              purchaseType: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            issue: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true,
                finalPrice: true,
                price: true,
                currency: true,
                stock: true,
                isAvailable: true,
                purchaseType: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.issue.finalPrice) * item.quantity,
    0
  );

  return { ...cart, subtotal };
};

const addToCart = async (userId: string, issueId: string, quantity: number = 1) => {
  const issue = await prisma.kishorkonthoIssue.findUnique({
    where: { id: issueId },
    select: { id: true, stock: true, isAvailable: true, finalPrice: true },
  });

  if (!issue || !issue.isAvailable) {
    throw new Error('Issue not available');
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_issueId: { cartId: cart.id, issueId } },
  });

  if (existingItem) {
    const newQty = Math.min(existingItem.quantity + quantity, issue.stock);
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    const qty = Math.min(quantity, issue.stock);
    await prisma.cartItem.create({
      data: { cartId: cart.id, issueId, quantity: qty },
    });
  }

  return getCart(userId);
};

const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error('Cart not found');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { issue: { select: { stock: true } } },
  });

  if (!item) throw new Error('Cart item not found');

  const qty = Math.min(quantity, item.issue.stock);
  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: qty },
  });

  return getCart(userId);
};

const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new Error('Cart not found');

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cartId: cart.id },
  });

  return getCart(userId);
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

export const CartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
