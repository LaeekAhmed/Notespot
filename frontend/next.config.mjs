import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
   logging: {
      fetches: {
         fullUrl: true,
      },
   },
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'note-spot.s3.us-east-2.amazonaws.com',
         },
      ],
   },
}

export default nextConfig;