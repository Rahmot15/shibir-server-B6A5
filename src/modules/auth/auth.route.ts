import express from 'express';
import { AuthController } from './auth.controller.js';
import auth from '../../middlewares/auth.js';
import { Role } from '@prisma/client';

const router = express.Router();

router.post("/register", AuthController.registerSupporter)
router.post("/login", AuthController.loginUser)
router.post("/refresh-token", AuthController.getNewToken)
router.get(
  "/me",
  auth(Role.ADMIN, Role.SUPPORTER, Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
  AuthController.getMe
);

export const AuthRoutes = router;