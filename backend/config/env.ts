import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
   dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Validate required environment variables
const requiredEnvVars = [
   'S3_ACCESS_KEY',
   'S3_SECRET_ACCESS_KEY', 
   'S3_BUCKET_REGION',
   'DATABASE_URL',
   'CLERK_PUBLISHABLE_KEY',
   'CLERK_SECRET_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
   throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Export validated environment variables
export const env = {
   S3_ACCESS_KEY: process.env.S3_ACCESS_KEY!,
   S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY!,
   S3_BUCKET_REGION: process.env.S3_BUCKET_REGION!,
   DATABASE_URL: process.env.DATABASE_URL!,
   FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
   PORT: process.env.PORT || 2000,
   NODE_ENV: process.env.NODE_ENV || "development",
   CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
   CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!
};

console.log('Environment variables loaded successfully');