import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { toNodeHandler } from 'better-auth/node';
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import router from './routes/index.js';
import { envVars } from './config/env.js';
import { auth } from './lib/auth.js';

const app: Application = express();

// EJS view engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`));

// CORS
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, 'http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Better Auth handler (must be before JSON parsers)
app.use("/api/auth", toNodeHandler(auth));

// parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

