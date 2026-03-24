import { ZodError } from 'zod';
import AppError from './AppError.js';

type PrismaKnownRequestErrorLike = {
  code: string;
  meta?: {
    target?: unknown;
  };
};

type PrismaValidationErrorLike = {
  message: string;
};

type PrismaInitializationErrorLike = {
  message: string;
};

// Error response interface
interface ErrorResponse {
  success: boolean;
  message: string;
  errorSource: string;
  err: unknown;
  slack?: string;
}

// Handle Zod validation errors
const handleZodError = (error: ZodError): ErrorResponse => {
  return {
    success: false,
    message: 'Validation Error',
    errorSource: 'ZOD_VALIDATION_ERROR',
    err: error.issues,
    slack: `Zod validation failed with ${error.issues.length} error(s)`,
  };
};

// Handle Prisma unique constraint errors
const handlePrismaUniqueError = (error: PrismaKnownRequestErrorLike): ErrorResponse => {
  return {
    success: false,
    message: 'Unique constraint violation',
    errorSource: 'PRISMA_UNIQUE_VIOLATION',
    err: {
      target: error.meta?.target,
      code: error.code,
    },
    slack: `Prisma unique constraint failed on ${error.meta?.target}`,
  };
};

// Handle Prisma validation errors
const handlePrismaValidationError = (error: PrismaValidationErrorLike): ErrorResponse => {
  return {
    success: false,
    message: 'Database validation error',
    errorSource: 'PRISMA_VALIDATION_ERROR',
    err: error.message,
    slack: 'Prisma validation error occurred',
  };
};

// Handle Prisma initialization errors
const handlePrismaInitializationError = (error: PrismaInitializationErrorLike): ErrorResponse => {
  return {
    success: false,
    message: 'Database connection failed',
    errorSource: 'PRISMA_INITIALIZATION_ERROR',
    err: error.message,
    slack: 'Prisma client initialization failed',
  };
};

// Handle custom app errors
const handleAppError = (error: AppError): ErrorResponse => {
  return {
    success: false,
    message: error.message,
    errorSource: 'APP_ERROR',
    err: {
      statusCode: error.statusCode,
    },
    slack: `App error: ${error.message}`,
  };
};

// Handle generic errors
const handleGenericError = (error: Error): ErrorResponse => {
  return {
    success: false,
    message: error.message || 'Something went wrong',
    errorSource: 'GENERIC_ERROR',
    err: {
      name: error.name,
      stack: error.stack,
    },
    slack: `Unexpected error: ${error.message}`,
  };
};

export {
  handleZodError,
  handlePrismaUniqueError,
  handlePrismaValidationError,
  handlePrismaInitializationError,
  handleAppError,
  handleGenericError,
  ErrorResponse,
};
