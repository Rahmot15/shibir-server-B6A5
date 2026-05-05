import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import { Role, UserStatus } from '@prisma/client';
import AppError from '../errors/AppError.js';
import { jwtUtils } from '../utils/jwt.js';
import catchAsync from '../utils/catchAsync.js';
import { envVars } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { CookieUtils } from '../utils/cookie.js';

const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Session Token Verification (Better Auth)
    const sessionToken = CookieUtils.getCookie(req, 'better-auth.session_token');

    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;

        // Check session expiration warning (less than 20% time remaining)
        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader('X-Session-Refresh', 'true');
          res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
          console.log('Session Expiring Soon!!');
        }

        // Check user status
        if (user.status === UserStatus.BLOCKED) {
          throw new AppError('Unauthorized access! User is blocked.', httpStatus.UNAUTHORIZED);
        }

        if (user.isDeleted || user.status === UserStatus.DELETED) {
          throw new AppError('Unauthorized access! User is deleted.', httpStatus.UNAUTHORIZED);
        }

        // Role verification
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as Role)) {
          throw new AppError(
            'Forbidden access! You do not have permission.',
            httpStatus.FORBIDDEN
          );
        }

        // Set user info to request object
        req.user = {
          id: user.id,
          role: user.role,
          email: user.email,
        } as any;

        return next();
      }
    }

    // 2. JWT Access Token Verification (Fallback or Manual Token)
    const accessToken =
      CookieUtils.getCookie(req, 'accessToken') ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : req.headers.authorization);

    if (!accessToken) {
      throw new AppError('Unauthorized access! No access token provided.', httpStatus.UNAUTHORIZED);
    }

    let decoded;
    try {
      decoded = jwtUtils.verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as Secret);
    } catch {
      throw new AppError('Invalid token', httpStatus.UNAUTHORIZED);
    }

    // Check if user still exists and is active in DB (optional but safer)
    const userInDb = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
    });

    if (!userInDb) {
      throw new AppError('User not found', httpStatus.UNAUTHORIZED);
    }

    if (userInDb.status === UserStatus.BLOCKED) {
      throw new AppError('User is blocked', httpStatus.UNAUTHORIZED);
    }

    if (userInDb.isDeleted || userInDb.status === UserStatus.DELETED) {
      throw new AppError('User is deleted', httpStatus.UNAUTHORIZED);
    }

    // Role verification for JWT
    if (requiredRoles.length > 0 && !requiredRoles.includes(userInDb.role as Role)) {
      throw new AppError('You have no permission', httpStatus.FORBIDDEN);
    }

    req.user = {
      id: userInDb.id,
      role: userInDb.role,
      email: userInDb.email,
    } as any;

    next();
  });
};

export default auth;
