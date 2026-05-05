import httpStatus from 'http-status';
import { Role } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import AppError from '../../errors/AppError.js';
import { jwtUtils } from '../../utils/jwt.js';
import { tokenUtils, AuthTokenPayload } from '../../utils/token.js';
import { envVars } from '../../config/env.js';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const registerUser = async (payload: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', httpStatus.CONFLICT);
  }

  const hashedPassword = await bcryptjs.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: Role.SUPPORTER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (payload: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  const isPasswordMatched = await bcryptjs.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError('Invalid email or password', httpStatus.UNAUTHORIZED);
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  };

  const accessToken = tokenUtils.getAccessToken(jwtPayload as any);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload as any);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    },
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  let decodedToken: AuthTokenPayload;

  try {
    decodedToken = jwtUtils.verifyToken(
      refreshToken,
      envVars.JWT_REFRESH_SECRET as string
    ) as AuthTokenPayload;
  } catch {
    throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({ where: { id: decodedToken.userId } });

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  const newAccessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  } as any);

  return {
    accessToken: newAccessToken,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  return user;
};


export const AuthService = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getMe,
};
