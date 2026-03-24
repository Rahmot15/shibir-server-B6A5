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

const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError
): TGenericErrorResponse => {
  const statusCode = 400;
  const message = 'Validation Error';

  // Prisma validation errors are usually generic strings.
  // We extract matching info if possible, otherwise provide the raw message.
  const errorSources: TErrorSource[] = [
    {
      path: '',
      message: error.message,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaValidationError;
