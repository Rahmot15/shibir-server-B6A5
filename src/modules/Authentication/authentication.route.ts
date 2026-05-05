import express from 'express';
import { AuthController } from './authentication.controller.js';

const router = express.Router();

router.post("/register", AuthController.registerSupporter)
router.post("/login", AuthController.loginUser)

export const AuthenticationRoutes = router;
