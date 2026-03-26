import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

export const generateSlug = () => nanoid(10);

export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET not set');
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  return jwt.verify(token, secret);
};
