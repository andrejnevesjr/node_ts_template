/* eslint-disable @typescript-eslint/no-unused-vars */
import { errorResponse } from '@utils/errorResponse';
import { NextFunction, Request, Response } from 'express';
const jwt = require('jsonwebtoken');
import { IUser } from '../types/IUser';
import { User } from '@models/userModel';

export interface CustomRequest extends Request {
  user?: IUser;
}

interface DecodedToken {
  id: string;
}

//check if user is authenticated
const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.cookies;
  // Make sure token exists
  if (!token) {
    return next(new errorResponse('You must Log in!', 401));
  }
  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string,
    ) as DecodedToken;
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new errorResponse('User not found!', 404));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new errorResponse('Something went wrong!', 401));
  }
};

//middleware for admin
const isAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === 'user') {
    return next(
      new errorResponse(
        'Something went wrong! It seems you do not have the required permissions to access this resource.',
        401,
      ),
    );
  }
  next();
};

export { isAuthenticated, isAdmin };
