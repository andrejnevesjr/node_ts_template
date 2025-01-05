import jwt from 'jsonwebtoken';
import Logger from '@libs/logger';

const SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export interface userPayload {
  userId: string;
  role: string;
}

// Generate JWT token
export const generateToken = (payload: userPayload): string => {
  if (!SECRET_KEY) {
    throw new Error('JWT secret key is not provided');
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

// Verify JWT token
export const verifyToken = (token: string): userPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as userPayload;
  } catch (error) {
    Logger.error(error);
    throw new Error('Invalid token');
  }
};
