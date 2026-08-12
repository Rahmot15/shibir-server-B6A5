import { z } from 'zod';

const checkoutZodSchema = z.object({
  body: z.object({
    shippingName: z.string().min(1, 'Name is required'),
    shippingPhone: z.string().min(1, 'Phone is required'),
    shippingAddress: z.string().min(1, 'Address is required'),
    notes: z.string().optional(),
    issueId: z.string().uuid().optional(),
    quantity: z.number().int().min(1).max(99).optional(),
  }),
});

export const OrderValidation = {
  checkoutZodSchema,
};
