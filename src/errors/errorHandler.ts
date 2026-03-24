import { ZodError } from 'zod';
import AppError from './AppError.js';
import { Prisma } from '@prisma/client';

export type TErrorSource = {
  path: string | number;
  message: string;
};

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
};

// Error response interface for the Global Handler
interface ErrorResponse {
  success: boolean;
  message: string;
  errorSources: TErrorSource[];
  err: unknown;
  stack?: string;
}

// Handle Zod validation errors
const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const statusCode = 400;
  const errorSources: TErrorSource[] = error.issues.map((issue) => ({
    path: issue.path[issue.path.length - 1] as string | number,
    message: issue.message,
  }));

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

// Handle Prisma Known Request Errors (P2002, P2025, etc.)
const handlePrismaKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Database Error';
  let errorSources: TErrorSource[] = [];

  if (error.code === 'P2002') {
    statusCode = 409;
    message = 'Unique constraint violation';
    const target = (error.meta?.target as string[]) || ['unknown'];
    errorSources = target.map((field) => ({
      path: field,
      message: `${field} already exists.`,
    }));
  } else if (error.code === 'P2025') {
    statusCode = 404;
    message = (error.meta?.cause as string) || 'Record not found';
    errorSources = [{ path: '', message }];
  } else {
    errorSources = [{ path: '', message: error.message }];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

// Handle Prisma Validation Errors
const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: 'Validation Error',
    errorSources: [
      {
        path: '',
        message: error.message,
      },
    ],
  };
};

const handleAppError = (error: AppError): TGenericErrorResponse => {
  return {
    statusCode: error.statusCode,
    message: error.message,
    errorSources: [
      {
        path: '',
        message: error.message,
      },
    ],
  };
};

const handleGenericError = (error: Error): TGenericErrorResponse => {
  return {
    statusCode: 500,
    message: error.message || 'Something went wrong!',
    errorSources: [
      {
        path: '',
        message: error.message || 'Something went wrong!',
      },
    ],
  };
};

export {
  handleZodError,
  handlePrismaKnownRequestError,
  handlePrismaValidationError,
  handleAppError,
  handleGenericError,
  ErrorResponse,
};
