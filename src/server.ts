import app from './app.js';
import config from './config/index.js';
import { Server } from 'http';
import { prisma } from './lib/prisma.js';

let server: Server;
let isShuttingDown = false;

const closeHttpServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const gracefulShutdown = async (signal: string, exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down server gracefully...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Could not close resources in time. Forcefully shutting down.');
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    await closeHttpServer();
    console.log('HTTP server closed.');
  } catch (error) {
    console.error('Error while closing HTTP server:', error);
  }

  try {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error while closing database connection:', error);
  }

  clearTimeout(forceExitTimer);
  process.exit(exitCode);
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception detected:', error);
  void gracefulShutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection detected:', reason);
  void gracefulShutdown('unhandledRejection', 1);
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT', 0);
});

async function main() {
  try {
    await prisma.$connect();
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    await prisma.$disconnect().catch(() => {
      // noop: process is exiting anyway
    });
    process.exit(1);
  }
}

main();
