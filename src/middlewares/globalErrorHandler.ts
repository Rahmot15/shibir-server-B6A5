import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import config from "../config/index.js";
import {
  handleZodError,
  handlePrismaKnownRequestError,
  handlePrismaValidationError,
  handleAppError,
  handleGenericError,
  TErrorSource,
} from "../errors/errorHandler.js";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSource[] = [
    {
      path: "",
      message: "Something went wrong!",
    },
  ];

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error?.status === 413 || error?.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload is too large';
    errorSources = [
      {
        path: '',
        message: 'Reduce note content size or compress/remove large embedded images.',
      },
    ];
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaKnownRequestError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error?.constructor?.name === "AppError") {
    const simplifiedError = handleAppError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof Error) {
    const simplifiedError = handleGenericError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.node_env === "development" ? error?.stack : null,
  });
};

export default globalErrorHandler;
