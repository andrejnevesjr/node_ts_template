import { NextFunction, Response } from 'express';
import { CustomRequest } from './auth';

//check if user is authenticated
const customHandle404 = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({ message: 'Oops! Resource not found.' });
  next();
};

export { customHandle404 };
