import { configure } from '@codegenie/serverless-express';
import app from './index';

// Configure the serverless-express handler
const handler = configure({
  app,
  // Enable binary media types for file uploads
  binarySettings: {
    contentTypes: [
      'application/pdf',
      'image/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/*',
      'application/zip',
      'application/x-zip-compressed'
    ]
  }
});

module.exports = { handler };
