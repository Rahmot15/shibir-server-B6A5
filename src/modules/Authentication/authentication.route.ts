import express from 'express';
import { AuthController } from './authentication.controller.js';
import auth from '../../middlewares/auth.js';
import { Role } from '@prisma/client';

const router = express.Router();

router.post("/register", AuthController.registerSupporter)
router.post("/login", AuthController.loginUser)
router.get(
  "/me",
  auth(Role.ADMIN, Role.SUPPORTER, Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
  AuthController.getMe
);

export const AuthenticationRoutes = router;
