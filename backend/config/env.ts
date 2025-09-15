import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Validate required environment variables
const requiredEnvVars = [
  // access key and secret key are picked up by the AWS SDK from the Lambda IAM role or the local environment
  'AWS_S3_BUCKET',
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
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET!,
  AWS_REGION: process.env.AWS_REGION || 'us-east-2',
  DATABASE_URL: process.env.DATABASE_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: process.env.PORT || 2000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  CLOUDWATCH_ENABLED: process.env.CLOUDWATCH_ENABLED || false,
};

console.log('Environment variables loaded successfully');