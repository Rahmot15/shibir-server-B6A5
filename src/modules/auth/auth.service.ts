import { UserStatus } from "@prisma/client";
import { auth } from "../../lib/auth.js";
import { tokenUtils, AuthTokenPayload } from "../../utils/token.js";
import { jwtUtils } from "../../utils/jwt.js";
import { envVars } from "../../config/env.js";
import AppError from "../../errors/AppError.js";
import httpStatus from 'http-status';
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { prisma } from "../../lib/prisma.js";
import bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";


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
        throw new AppError(" Failed to register ", httpStatus.BAD_REQUEST);
    }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
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

  let data;

  try {
    data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch {
    data = await loginLegacyUser(email, password);
  }

   if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError("User is blocked", httpStatus.FORBIDDEN);
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError("User is deleted", httpStatus.NOT_FOUND);
    }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
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

const loginLegacyUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.password) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const isPasswordMatched = await bcryptjs.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const sessionToken = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000);

  await prisma.session.create({
    data: {
      id: randomUUID(),
      token: sessionToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    token: sessionToken,
    user,
  };
};

const resendEmailVerificationOTP = async (email: string) => {
  await auth.api.sendVerificationOTP({
    body: { email, type: "email-verification" },
  });
};

const verifyEmailOTP = async (email: string, otp: string) => {
  const data = await auth.api.verifyEmailOTP({ body: { email, otp } });

  if (!data.user) {
    throw new AppError("Email verification failed", httpStatus.BAD_REQUEST);
  }

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError("User is blocked", httpStatus.FORBIDDEN);
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name || "",
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return { ...data, accessToken, refreshToken };
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

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken?: string
) => {
  if (!sessionToken) {
    throw new AppError("Session token is missing", httpStatus.UNAUTHORIZED);
  }

  const session = await prisma.session.findFirst({
    where: {
      token: sessionToken,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) {
    throw new AppError("Invalid session token", httpStatus.UNAUTHORIZED);
  }

  const { currentPassword, newPassword } = payload;

  // Older Shibir users have their hash in User.password; Better Auth users
  // keep it in Account.password. Support both while the existing users migrate.
  if (session.user.password) {
    const isPasswordMatched = await bcryptjs.compare(
      currentPassword,
      session.user.password
    );

    if (!isPasswordMatched) {
      throw new AppError("Current password is incorrect", httpStatus.UNAUTHORIZED);
    }

    const password = await bcryptjs.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password, needPasswordChange: false },
    });

    await prisma.session.deleteMany({
      where: { userId: session.user.id, token: { not: sessionToken } },
    });
  } else {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
    });

    if (session.user.needPasswordChange) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { needPasswordChange: false },
      });
    }
  }

  const user = session.user;
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name || "",
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name || "",
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });

  return { accessToken, refreshToken };
};

const logoutUser = async (sessionToken?: string) => {
  if (!sessionToken) {
    return null;
  }

  await prisma.session.deleteMany({ where: { token: sessionToken } });
  return null;
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  if (!isUserExist.emailVerified) {
    throw new AppError("Email not verified", httpStatus.BAD_REQUEST);
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExist) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  if (!isUserExist.emailVerified) {
    throw new AppError("Email not verified", httpStatus.BAD_REQUEST);
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    },
  });
};

export const AuthService = {
  RegisterSupporter,
  loginUser,
  resendEmailVerificationOTP,
  verifyEmailOTP,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  forgetPassword,
  resetPassword,
};

