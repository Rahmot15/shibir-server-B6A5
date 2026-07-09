import { UserStatus } from "@prisma/client";
import { auth } from "../../lib/auth.js";
import { tokenUtils, AuthTokenPayload } from "../../utils/token.js";
import { jwtUtils } from "../../utils/jwt.js";
import { envVars } from "../../config/env.js";
import AppError from "../../errors/AppError.js";
import httpStatus from 'http-status';
import { ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";


const RegisterSupporter = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      // role: Role.SUPPORTER,
    },
  });
  console.log(data.user.id);

  if (!data.user) {
        // throw new Error("Failed to register patient");
        throw new AppError("Failed to register patient", httpStatus.BAD_REQUEST);
    }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};


const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

   if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError("User is blocked", httpStatus.FORBIDDEN);
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError("User is deleted", httpStatus.NOT_FOUND);
    }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    // select appropriate fields based on your schema
    // for now, let's select basic info as I don't see doctor/patient models here
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!isUserExists) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  return isUserExists;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new AppError("Invalid session token", httpStatus.UNAUTHORIZED);
  }

  let verifiedRefreshToken;
  try {
    verifiedRefreshToken = jwtUtils.verifyToken(
      refreshToken,
      envVars.JWT_REFRESH_SECRET
    );
  } catch (error) {
    throw new AppError("Invalid refresh token", httpStatus.UNAUTHORIZED);
  }

  const data = verifiedRefreshToken as AuthTokenPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const updatedSession = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: updatedSession.token,
  };
};

export const AuthService = {
  RegisterSupporter,
  loginUser,
  getMe,
  getNewToken,
};