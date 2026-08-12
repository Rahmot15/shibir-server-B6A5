import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { OrderController } from './order.controller.js';
import { OrderValidation } from './order.validation.js';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/checkout',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  validateRequest(OrderValidation.checkoutZodSchema),
  OrderController.checkout
);

router.get(
  '/',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  OrderController.getOrders
);

router.get(
  '/:id',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  OrderController.getOrderById
);

export const OrderRoutes = router;
