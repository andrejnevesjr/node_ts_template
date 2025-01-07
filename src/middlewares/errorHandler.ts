const errorResponse = require('../utils/errorResponse');

import { ErrorRequestHandler } from 'express';
import { Error } from 'mongoose';
import { MongoError } from 'mongodb';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if ((err as MongoError).name === 'CastError') {
    const message = `Ressource not found ${err.value}`;
    error = new errorResponse(message, 404);
  }

  //Mongoose duplicate value
  if ((err as MongoError).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new errorResponse(message, 400);
  }

  //Mongoose validation error
  if (error instanceof Error.ValidationError) {
    const message = Object.values(error.errors).map((err) => err.message);
    error = new errorResponse(message, 400);
  }

  //Other errors
  res.status(error.statusCode || 500).json({
    sucess: false,
    error: error.message || 'Server Error',
  });
  next();
};

export default errorHandler;
