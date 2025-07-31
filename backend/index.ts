import "./config/env";
import { env } from "./config/env";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import methodOverride from "method-override";
import mongoose from "mongoose";
import { clerkMiddleware, getAuth } from "@clerk/express";
import documentsRouter from "./routes/api/documents";
import authorsRouter from "./routes/api/authors";
import { checkAuth } from "./utils/auth";

const app: Application = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));


// Checks the request's cookies and headers for a session JWT and, if found, attaches the Auth object to the request object
app.use(clerkMiddleware());

// Middleware to log the requested endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
   const start = Date.now();
   
   res.on('finish', () => {
      const duration = Date.now() - start;
      const contentLength = res.get('content-length') || 0;
      const error = res.locals.error;
      const { userId } = getAuth(req);
      console.log(
         `\n${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms ${contentLength}b` +
         (error ? `\nError: ${error.message}` : '' +
         (userId ? `\nAuth: ${userId}` : '')
         )
      );
   });
   next();
});

// Middleware to parse JSON and urlencoded bodies
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));

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
   .once("open", () => console.log("Database connected!\n"))
   .on("error", (err: Error) => console.log("Connection failed!"));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
   res.json({
      success: true,
      message: "NoteSpot API is healthy",
      timestamp: new Date().toISOString()
   });
});

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

// 404 handler for API routes
app.use("/api/*", (req: Request, res: Response) => {
   res.status(404).json({
      success: false,
      message: "API endpoint not found"
   });
});


// Global error handling middleware (must be after routes)
interface CustomError extends Error {
   status?: number;
   statusCode?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
   // Log the full error stack
   console.error('\nError:', err.message);
   console.error(err.stack);

   // Handle Clerk authentication errors
   if (err.message === 'Unauthenticated') {
      res.status(401).json({
         success: false,
         error: 'Authentication required'
      });
      return;
   }

   const status = err.status || err.statusCode || 500;
   const message = err.message || 'Internal server error';

   res.status(status).json({
      success: false,
      error: message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack })
   });
});

// Start server
const PORT: number = env.PORT;
app.listen(PORT, () => {
   console.log(`\nServer is running at http://localhost:${PORT} (Environment: ${env.NODE_ENV})`);
}); 