/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { IUserDocument } from '../types/IUser';
import { CustomRequest } from '../middlewares/auth';
import { errorResponse } from '@utils/errorResponse';
import sendEmail from '@utils/sendEmail';
import * as crypto from 'crypto';
import { User } from '@models/userModel';

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return next(new errorResponse('E-mail already registred', 400));
    }

    req.body.role = 'user'; // this is to prevent anyone creating an admin user.
    req.body.active = false; // this is to prevent anyone activate an user.
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email) {
      return next(new errorResponse('please add email', 403));
    }
    if (!password) {
      return next(new errorResponse('Please add  password', 403));
    }

    //check user email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new errorResponse('Invalid credentials', 400));
    }

    //check password
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new errorResponse('Invalid credentials', 400));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

interface TokenOptions {
  maxAge: number;
  httpOnly: boolean;
  secure?: boolean;
}

const sendTokenResponse = async (
  user: IUserDocument,

  codeStatus: number,
  res: Response,
) => {
  const token = await user.getJwtToken();
  const options: TokenOptions = { maxAge: 60 * 60 * 1000, httpOnly: true };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(codeStatus).cookie('token', token, options).json({
    success: true,
    id: user._id,
    role: user.role,
    active: user.active,
  });
};

//log out
const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('token');
  res.status(200);
  res.json({
    success: true,
    message: 'logged out',
  });
};

//user profile
const userProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = await User.findById(req.user?.id).select('-password');
  res.status(200);
  res.json({
    success: true,
    user,
  });
};

// FORGET PASSWORD
exports.forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new errorResponse('there is no user with this e-mail', 404));
  }

  // get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //const reset url
  const resetUrl =
    process.env.BASE_URL + `/api/users/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) requested
   a password reset. Please click on the link below: <br/><br/>
  <a  rel="noopener noreferrer" target="_blank" href=${resetUrl}>${resetUrl}</a>
  <br/> <br/>N.B: The link will expire in 10 minutes, if it wasn't you, ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password',
      message,
    });
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(error);
  }
};

//RESET PASSWORD
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new errorResponse('Link expired', 400));
    }

    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    next();

    res.status(200);
    res.json({
      success: true,
      message: 'password updated with success!',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

export { signup, signin, userProfile, resetPassword, logout };
