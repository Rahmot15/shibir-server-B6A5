import { Request, Response } from 'express';

const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    error: {
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
    },
  });
};

export default notFoundMiddleware;
