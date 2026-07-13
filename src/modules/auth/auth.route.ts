import express from 'express';
import { AuthController } from './auth.controller.js';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { Role } from '@prisma/client';
import { AuthValidation } from './auth.validation.js';

const router = express.Router();

router.post("/register", AuthController.registerSupporter)
router.post("/login", AuthController.loginUser)
router.post("/resend-verification-otp", AuthController.resendEmailVerificationOTP)
router.post("/verify-email", AuthController.verifyEmailOTP)
router.post("/refresh-token", AuthController.getNewToken)
router.post(
  "/change-password",
  auth(Role.ADMIN, Role.SUPPORTER, Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword
)
router.post("/logout", AuthController.logoutUser)
router.get(
  "/me",
  auth(Role.ADMIN, Role.SUPPORTER, Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
  AuthController.getMe
);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
