import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserController } from './user.controller.js';
import { userValidationSchema } from './user.validation.js';

const router = express.Router();

router.get('/', auth(Role.ADMIN), UserController.getAllUsers);

router.patch(
	'/:id/role',
	auth(Role.ADMIN),
	validateRequest(userValidationSchema.updateRoleValidationSchema),
	UserController.updateUserRole,
);

router.patch(
	'/:id/email-verified',
	auth(Role.ADMIN),
	validateRequest(userValidationSchema.updateEmailVerifiedValidationSchema),
	UserController.updateUserEmailVerified,
);

export const UserRoutes = router;
