import express from 'express';
import { AuthController } from './auth.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { authValidationSchema } from './auth.validation.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.post(
  '/register',
  validateRequest(authValidationSchema.registerValidationSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(authValidationSchema.loginValidationSchema),
  AuthController.login
);

router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', auth(), AuthController.getMe);

export const AuthRoutes = router;
