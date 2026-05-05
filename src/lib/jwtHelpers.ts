import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { envVars } from '../config/env.js';

type AuthTokenPayload = {
  id: string;
  role: string;
};

const createToken = (
  payload: AuthTokenPayload,
  secret: Secret,
  expiresIn: SignOptions['expiresIn']
) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const createAccessToken = (payload: AuthTokenPayload) => {
  return createToken(
    payload,
    envVars.JWT_ACCESS_SECRET as Secret,
    envVars.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']
  );
};

const createRefreshToken = (payload: AuthTokenPayload) => {
  return createToken(
    payload,
    envVars.JWT_REFRESH_SECRET as Secret,
    envVars.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']
  );
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export {
  AuthTokenPayload,
  createAccessToken,
  createRefreshToken,
  verifyToken,
};
