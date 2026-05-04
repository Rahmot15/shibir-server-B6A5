import express from 'express';
import { AuthController } from './authentication.controller.js';

const router = express.Router();

router.post("/register", AuthController.registerSupporter)

export const AuthenticationRoutes = router;
