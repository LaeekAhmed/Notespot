import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import compression from "compression";
import { S3 } from "@aws-sdk/client-s3";
import methodOverride from "method-override";
import mongoose from "mongoose";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// Load environment variables from .env file
if (process.env.NODE_ENV !== "production") {
   dotenv.config();
}

// S3 Client Configuration
const s3 = new S3({
   credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
   },
   region: process.env.S3_BUCKET_REGION,
});

export { s3 };

const app = express();

app.use(cors());

// middleware to log the requested endpoints
app.use((req, res, next) => {
   console.log(`\n${req.method} ${req.url}`);
   next();
});

app.get("/protected-endpoint", ClerkExpressRequireAuth(), (req, res) => {
   res.json(req.auth);
});

// Middleware to parse JSON and urlencoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
   res.json({ message: "notespot API is running" });
});

// Import routes/controllers
import authorRouter from "./routes/authors.js";
import bookRouter from "./routes/books.js";
import { kMaxLength } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));

// Other middlewares
app.use(methodOverride("_method"));

// Use compression with options
app.use(
   compression({
      level: 6,
      threshold: 10 * 1000,
      filter: (req, res) => {
         if (req.headers["x-no-compression"]) return false;
         return compression.filter(req, res);
      },
   })
);

// Database connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
mongoose.connection
   .once("open", () => console.log("Database connected!\n"))
   .on("error", (err) => console.log("Connection failed!"));

// Routes
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
   console.error(err.stack);

   const status = err.status || err.statusCode || 500;
   const message = err.message || 'Internal server error';

   res.status(status).json({ error: message });
});

// Start server
const PORT = process.env.PORT || "5000";
app.listen(PORT, () => {
   console.log(
      `\nServer is running at http://localhost:${PORT} (Environment: ${process.env.NODE_ENV})`
   );
});
