import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { AuthService } from './auth.service.js';
import config from '../../config/index.js';
import AppError from '../../errors/AppError.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === 'production',
  sameSite: 'lax' as const,
};

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.registerUser(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie('accessToken', result.accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', result.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: result.user,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken;

  if (!refreshTokenValue) {
    throw new AppError('Refresh token is required', httpStatus.UNAUTHORIZED);
  }

  const result = await AuthService.refreshAccessToken(refreshTokenValue as string);

  res.cookie('accessToken', result.accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: {
      accessToken: result.accessToken,
    },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logout successful',
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.getMe(req.user!.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});


export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
