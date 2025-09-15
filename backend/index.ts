import { env } from "./config/env";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import methodOverride from "method-override";
import mongoose from "mongoose";
import { clerkMiddleware, getAuth } from "@clerk/express";
import morgan from "morgan";
import documentsRouter from "./routes/api/documents";
import authorsRouter from "./routes/api/authors";
import { checkAuth } from "./utils/auth";
import { metricsService } from "./utils/metrics";
import { logger } from "./utils/logger";
import os from "os";

const app: Application = express();

// CORS configuration
app.use(
  cors(
    {
      origin: true, // Allow all origins
      credentials: true
    })
);

// HTTP logging with Morgan (logs to Winston, which goes to console + CloudWatch)
app.use(morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);

  // Safely get userId - only call getAuth if Clerk middleware has been applied
  let userId = 'anonymous';
  try {
    const auth = getAuth(req);
    userId = auth?.userId || 'anonymous';
  } catch (error) {
    // getAuth will throw if Clerk middleware hasn't been applied yet
    userId = 'anonymous';
  }

  // Set log level based on status code
  const statusCode = parseInt(status || '200');

  if (statusCode >= 500) {
    // For server errors, include error details if available
    const errorDetails = (res as any).errorDetails;
    if (errorDetails) {
      logger.error(`${method} ${url} ${status} ${responseTime} ms ${userId} \nMessage: ${errorDetails.error} \nStack: ${errorDetails.stack}`);
    } else {
      logger.error(`${method} ${url} ${status} ${responseTime} ms ${userId}`);
    }
  } else if (statusCode >= 400) {
    logger.warn(`${method} ${url} ${status} ${responseTime} ms ${userId}`);
  } else {
    logger.info(`${method} ${url} ${status} ${responseTime} ms ${userId}`);
  }

  // Return null to prevent Morgan from printing duplicate message
  return null;
}));

// Metrics middleware (separate from logging)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Record metrics if enabled
    if (env.CLOUDWATCH_ENABLED) {
      metricsService.recordRequest(req.method, res.statusCode, duration);
    }
  });

  next();
});

// Middleware to parse JSON and urlencoded bodies
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// Other middlewares
app.use(methodOverride("_method"));

// Use compression with options
app.use(
  compression({
    level: 6,
    threshold: 10 * 1000,
    filter: (req: Request, res: Response) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// Database connection
mongoose.set("strictQuery", false);
mongoose.connect(env.DATABASE_URL);
mongoose.connection
  .once("open", () => {
    logger.info("Database connected!");
  })
  .on("error", (err: Error) => {
    logger.error("Database connection failed!", { error: err.message, stack: err.stack });
  });

// Health check endpoint
const healthCheck = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const dbHealthy = mongoose.connection.readyState === 1;

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    instanceId: `${os.hostname()}`,
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor(
      (uptime % 3600) / 60
    )}m`,
    environment: env.NODE_ENV,
    database: dbHealthy ? "connected" : "disconnected",
    nodeVersion: process.version,
    platform: process.platform,
  };

  res.json(healthData);
};

app.get("/", healthCheck);
app.get("/health", healthCheck);

// Checks the request's cookies and headers for a session JWT and, if found, attaches the Auth object to the request object
// Apply only to API routes that need authentication
app.use("/api", clerkMiddleware());

// API routes
app.use("/api/documents", documentsRouter);
app.use("/api/authors", authorsRouter);

// Protected endpoint example
app.get("/api/protected", checkAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "This is a protected endpoint",
    user: req.auth()
  });
});

// Catch all invalid endpoints
app.use("/*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Attach error details to response object for Morgan to capture above in the middleware
  (res as any).errorDetails = {
    error: err.message,
    stack: err.stack
  };

  // Handle Clerk authentication errors
  if (err.message === "Unauthenticated") {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  res.status(500).json({ success: false, error: err.message || "Internal server error", stack: err.stack });
});

// Start server (only in non-Lambda environments)
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  const PORT: number = env.PORT;
  app.listen(PORT, () => {
    logger.info(`Server started`, { port: PORT, environment: env.NODE_ENV });
  });
}

// Export app for Lambda
export default app;