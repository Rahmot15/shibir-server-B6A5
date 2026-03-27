import httpStatus from 'http-status';
import { Role } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import AppError from '../../errors/AppError.js';
import {
  AuthTokenPayload,
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from '../../lib/jwtHelpers.js';
import config from '../../config/index.js';

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

  const jwtPayload: AuthTokenPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

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
    decodedToken = verifyToken(
      refreshToken,
      config.jwt_refresh_secret as string
    ) as AuthTokenPayload;
  } catch {
    throw new AppError('Invalid refresh token', httpStatus.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({ where: { id: decodedToken.id } });

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  const newAccessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

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
