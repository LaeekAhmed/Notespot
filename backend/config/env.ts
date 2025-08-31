import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
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
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
  AWS_REGION: process.env.AWS_REGION!,
  DATABASE_URL: process.env.DATABASE_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: process.env.PORT || 2000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  CLOUDWATCH_ENABLED: process.env.CLOUDWATCH_ENABLED || false,
};

console.log('Environment variables loaded successfully');