/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { User } from '@models/userModel';

//load all users
const allUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.status(200).json({
      success: true,
      users,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//show single user
const singleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json({
      success: true,
      user,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//edit single user
const editUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
    next();
  } catch (error) {
    return next(error);
  }
};

//delete user
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'user deleted',
    });
    next();
  } catch (error) {
    return next(error);
  }
};

export { allUsers, singleUser, editUser, deleteUser };
