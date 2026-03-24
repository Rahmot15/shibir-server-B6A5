import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

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
    config.jwt_access_secret as Secret,
    config.jwt_access_expires_in as SignOptions['expiresIn']
  );
};

const createRefreshToken = (payload: AuthTokenPayload) => {
  return createToken(
    payload,
    config.jwt_refresh_secret as Secret,
    config.jwt_refresh_expires_in as SignOptions['expiresIn']
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
