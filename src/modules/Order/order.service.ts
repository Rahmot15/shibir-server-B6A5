import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

const checkout = async (
  userId: string,
  data: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    notes?: string;
    issueId?: string;
    quantity?: number;
  }
) => {
  let itemsToOrder: { issueId: string; quantity: number }[] = [];

  if (data.issueId) {
    // Direct buy (Buy Now)
    itemsToOrder = [{ issueId: data.issueId, quantity: data.quantity || 1 }];
  } else {
    // Checkout from cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    itemsToOrder = cart.items.map((item) => ({
      issueId: item.issueId,
      quantity: item.quantity,
    }));
  }

  // Validate all issues exist and have stock
  const issueIds = itemsToOrder.map((i) => i.issueId);
  const issues = await prisma.kishorkonthoIssue.findMany({
    where: { id: { in: issueIds }, isAvailable: true },
  });

  if (issues.length !== issueIds.length) {
    throw new Error('One or more items are not available');
  }

  const issueMap = new Map(issues.map((i) => [i.id, i]));

  // Build order items with prices
  let subtotal = new Prisma.Decimal(0);
  let totalDiscount = new Prisma.Decimal(0);

  const orderItemsData = itemsToOrder.map((item) => {
    const issue = issueMap.get(item.issueId)!;
    const qty = Math.min(item.quantity, issue.stock);
    const unitPrice = issue.finalPrice;
    const originalTotal = new Prisma.Decimal(Number(issue.price) * qty);
    const discountedTotal = new Prisma.Decimal(Number(unitPrice) * qty);
    const discountAmount = originalTotal.minus(discountedTotal);

    subtotal = subtotal.plus(originalTotal);
    totalDiscount = totalDiscount.plus(discountAmount);

    return {
      issueId: issue.id,
      title: issue.title,
      coverImage: issue.coverImage,
      unitPrice,
      quantity: qty,
      total: discountedTotal,
    };
  });

  const total = subtotal.minus(totalDiscount);

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        subtotal,
        discount: totalDiscount,
        total,
        shippingName: data.shippingName,
        shippingPhone: data.shippingPhone,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Decrement stock and increment purchases
    for (const item of orderItemsData) {
      await tx.kishorkonthoIssue.update({
        where: { id: item.issueId },
        data: {
          stock: { decrement: item.quantity },
          purchases: { increment: item.quantity },
        },
      });
    }

    // Clear cart if checkout from cart
    if (!data.issueId) {
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return newOrder;
  });

  return order;
};

const getOrders = async (userId: string, query: { page?: number; limit?: number; status?: string }) => {
  const pageNum = Math.max(1, Number(query.page || 1));
  const limitNum = Math.min(50, Math.max(1, Number(query.limit || 10)));
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.OrderWhereInput = { userId };
  if (query.status) {
    where.status = query.status as OrderStatus;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            unitPrice: true,
            quantity: true,
            total: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getOrderById = async (userId: string, orderId: string) => {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
    },
  });
};

export const OrderService = {
  checkout,
  getOrders,
  getOrderById,
};
