import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import DatabaseService from "./services/database";
import { SERVER, logger } from "./utils";
import { BaseRouter } from "./routes";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLoggerMiddleware } from "./middleware/requestLogger";
import { errorHandlerMiddleware } from "./middleware/errorHandler.middleware";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Load environment variables from .env file BEFORE initializing other modules
// This ensures all environment variables are available when modules are initialized
if (process.env.NODE_ENV !== "production") {
  const result = dotenv.config({ quiet: true });

  if (result.error) {
    logger.error("✗ Failed to load .env file:", result.error);
  } else {
    const envCount = Object.keys(result.parsed || {}).length;
    logger.info(`✓ Loaded ${envCount} environment variables from .env`);
  }
} else {
  logger.info(
    "✓ Running in production mode - using process environment variables"
  );
}

const app: Express = express();
const port = process.env.PORT || SERVER.PORT;

// ============================================================================
// MIDDLEWARE
// ============================================================================

const whitelist = [
  process.env.CLIENT_SIDE_URL,
  process.env.SETTINGS_CLIENT_SIDE_URL,
  process.env.ADMIN_URL,
  process.env.MANAGE_URL,
];

// Request ID middleware - must be first to attach ID to all requests
app.use(requestIdMiddleware);

// Request logging middleware - logs incoming and outgoing requests
app.use(requestLoggerMiddleware);

const corsOptions = {
  origin(
    origin: string | undefined,
    callback: (error: Error | null, result: boolean) => void
  ) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
};

// CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cookieSession({
    name: "zwilt-tickets",
    signed: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "lax",
    secure: process.env.NODE_ENV !== "development",
    ...(process.env.NODE_ENV !== "development" && {
      domain: process.env.ZWILT_DOMAIN,
    }),
  })
);

// ============================================================================
// ROUTES
// ============================================================================

app.use(BaseRouter);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

/**
 * Start the Express server
 */
async function startServer(): Promise<void> {
  try {
    await DatabaseService.getInstance().connect();

    app.listen(port, () => {
      logger.info("Server started successfully");
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use(errorHandlerMiddleware);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully (SIGINT)...");
  await DatabaseService.getInstance().disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully (SIGTERM)...");
  await DatabaseService.getInstance().disconnect();
  process.exit(0);
});

startServer();
