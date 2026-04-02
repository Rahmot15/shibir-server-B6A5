import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../config/index.js';
import AppError from '../errors/AppError.js';
import { verifyToken } from '../lib/jwtHelpers.js';
import catchAsync from '../utils/catchAsync.js';

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.headers.authorization;

    if (!token) {
      throw new AppError('You are not authorized', httpStatus.UNAUTHORIZED);
    }

    // if authorization header used, strip Bearer
    const tokenValue = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    let decoded;
    try {
      decoded = verifyToken(tokenValue, config.jwt_access_secret as Secret);
    } catch {
      throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
    }

    const { id, role } = decoded;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError('You have no permission', httpStatus.FORBIDDEN);
    }

    req.user = { id, role } as any;
    next();
  });
};

export default auth;
