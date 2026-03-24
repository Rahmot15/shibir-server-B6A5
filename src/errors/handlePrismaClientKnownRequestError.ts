import { Prisma } from '@prisma/client';
import { TErrorSource, TGenericErrorResponse } from './handlePrismaValidationError.js';

const handlePrismaClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Prisma Client Known Request Error';
  let errorSources: TErrorSource[] = [];

  // Handling common Prisma error codes
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
    errorSources = [
      {
        path: '',
        message: message,
      },
    ];
  } else if (error.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
    errorSources = [
      {
        path: (error.meta?.field_name as string) || '',
        message: 'The related record does not exist.',
      },
    ];
  } else {
    errorSources = [
      {
        path: '',
        message: error.message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaClientKnownRequestError;
