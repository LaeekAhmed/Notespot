declare global {
   namespace NodeJS {
      interface ProcessEnv {
         NODE_ENV: 'development' | 'production' | 'test';
         PORT?: string;
         DATABASE_URL: string;
         S3_ACCESS_KEY: string;
         S3_SECRET_ACCESS_KEY: string;
         S3_BUCKET_REGION: string;
         CLERK_PUBLISHABLE_KEY?: string;
         CLERK_SECRET_KEY?: string;
         FRONTEND_URL?: string;
      }
   }
}

export { }; 