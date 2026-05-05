import { Response } from "express";
import { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env.js";
import { jwtUtils } from "./jwt.js";
import { CookieUtils } from "./cookie.js";

export type AuthTokenPayload = {
  userId: string;
  role: string;
  name: string;
  email: string;
  status: string;
  isDeleted: boolean;
  emailVerified: boolean;
};

//Creating access token
const getAccessToken = (payload: AuthTokenPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.JWT_ACCESS_SECRET as Secret,
        { expiresIn: envVars.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] }
    );

    return accessToken;
}

const getRefreshToken = (payload: AuthTokenPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.JWT_REFRESH_SECRET as Secret,
        { expiresIn: envVars.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] }
    );
    return refreshToken;
}


const setAccessTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //7d
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        //1 day
        maxAge: 60 * 60 * 24 * 1000,
    });
}



export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie,
}
