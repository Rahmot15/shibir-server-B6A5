import { z } from 'zod';

const addToCartZodSchema = z.object({
  body: z.object({
    issueId: z.string().uuid({ message: 'Valid issue ID required' }),
    quantity: z.number().int().min(1).max(99).optional().default(1),
  }),
});

const updateCartItemZodSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).max(99),
  }),
});

export const CartValidation = {
  addToCartZodSchema,
  updateCartItemZodSchema,
};
