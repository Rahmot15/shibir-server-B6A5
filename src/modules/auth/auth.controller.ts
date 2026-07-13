import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthService } from "./auth.service.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { tokenUtils } from "../../utils/token.js";
import { CookieUtils } from "../../utils/cookie.js";
import status from "http-status";
import AppError from "../../errors/AppError.js";

const registerSupporter = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  console.log(payload);

  const result = await AuthService.RegisterSupporter(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Supporter registered successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        console.log({user});
        const result = await AuthService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User profile fetched successfully",
            data: result,
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken;
        const betterAuthSessionToken = req.cookies?.["better-auth.session_token"];
        if (!refreshToken) {
            throw new AppError("Refresh token is missing", status.UNAUTHORIZED);
        }
        if (!betterAuthSessionToken) {
            throw new AppError("Session token is missing", status.UNAUTHORIZED);
        }
        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
)

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies?.["better-auth.session_token"];
  const result = await AuthService.changePassword(req.body, sessionToken);

  tokenUtils.setAccessTokenCookie(res, result.accessToken);
  tokenUtils.setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const resendEmailVerificationOTP = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resendEmailVerificationOTP(req.body.email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "If the account needs verification, a new OTP has been sent.",
    data: null,
  });
});

const verifyEmailOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyEmailOTP(req.body.email, req.body.otp);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  if (token) tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
    data: { token, accessToken, refreshToken, ...rest },
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies?.["better-auth.session_token"];
  await AuthService.logoutUser(sessionToken);
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
  };
  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: null,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email successfully",
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

export const AuthController = {
  registerSupporter,
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

