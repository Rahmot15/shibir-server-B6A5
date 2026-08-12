import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { CartController } from './cart.controller.js';
import { CartValidation } from './cart.validation.js';
import { Role } from '@prisma/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  CartController.getCart
);

router.post(
  '/',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  validateRequest(CartValidation.addToCartZodSchema),
  CartController.addToCart
);

router.patch(
  '/:itemId',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  validateRequest(CartValidation.updateCartItemZodSchema),
  CartController.updateCartItem
);

router.delete(
  '/:itemId',
  auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
  CartController.removeCartItem
);

export const CartRoutes = router;
