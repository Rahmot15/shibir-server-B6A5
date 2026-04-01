import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import router from './routes/index.js';

const app: Application = express();

// parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Shibir Server');
});

// Not found middleware
app.use(notFoundMiddleware);

// Global error handler middleware
app.use(globalErrorHandler);

export default app;
