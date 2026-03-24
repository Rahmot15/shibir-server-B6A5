import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import AppError from '../errors/AppError.js';
import {
  handleZodError,
  handlePrismaUniqueError,
  handlePrismaValidationError,
  handlePrismaInitializationError,
  handleAppError,
  handleGenericError,
  ErrorResponse,
} from '../errors/errorHandler.js';

const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errorResponse: ErrorResponse;
  let statusCode = 500;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    errorResponse = handleZodError(error);
    statusCode = 400;
  }
  // Handle Prisma known request errors (unique violations, etc.)
  else if (
    error instanceof Error &&
    error.constructor.name === 'PrismaClientKnownRequestError'
  ) {
    const prismaError = error as any;
    errorResponse = handlePrismaUniqueError(prismaError);
    statusCode = prismaError.code === 'P2002' ? 409 : 400;
  }
  // Handle Prisma validation errors
  else if (
    error instanceof Error &&
    error.constructor.name === 'PrismaClientValidationError'
  ) {
    const prismaError = error as any;
    errorResponse = handlePrismaValidationError(prismaError);
    statusCode = 400;
  }
  // Handle Prisma initialization errors
  else if (
    error instanceof Error &&
    error.constructor.name === 'PrismaClientInitializationError'
  ) {
    const prismaError = error as any;
    errorResponse = handlePrismaInitializationError(prismaError);
    statusCode = 500;
  }
  // Handle custom app errors
  else if (error instanceof AppError) {
    errorResponse = handleAppError(error as any);
    statusCode = (error as any).statusCode;
  }
  // Handle generic errors
  else if (error instanceof Error) {
    errorResponse = handleGenericError(error);
    statusCode = 500;
  }
  // Handle unknown errors
  else {
    errorResponse = {
      success: false,
      message: 'An unknown error occurred',
      errorSource: 'UNKNOWN_ERROR',
      err: error,
      slack: 'Unknown error type encountered',
    };
    statusCode = 500;
  }

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
