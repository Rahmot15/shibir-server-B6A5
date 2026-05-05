
import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: Secret, { expiresIn }: SignOptions) => {
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
}

const verifyToken = (token: string, secret: Secret): JwtPayload => {
    return jwt.verify(token, secret) as JwtPayload;
}

const decodeToken = (token: string) => {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
}

export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken,
}
