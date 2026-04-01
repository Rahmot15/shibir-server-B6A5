import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { UserService } from './user.service.js';

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
    const result = await UserService.getAllUsers();

    res.status(status.OK).json({
        success: true,
        message: 'Users fetched successfully',
        data: result,
    });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.updateUserRole(req.params.id as string, req.body.role);

    res.status(status.OK).json({
        success: true,
        message: 'User role updated successfully',
        data: result,
    });
});

const updateUserEmailVerified = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.updateUserEmailVerified(
        req.params.id as string,
        req.body.emailVerified,
    );

    res.status(status.OK).json({
        success: true,
        message: 'User email verification status updated successfully',
        data: result,
    });
});

export const UserController = {
    getAllUsers,
    updateUserRole,
    updateUserEmailVerified,
};
