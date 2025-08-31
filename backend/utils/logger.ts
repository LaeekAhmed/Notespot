import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';
import { env } from '../config/env';
import os from 'os';

// Create Winston logger with CloudWatch transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ]  
});

// Add CloudWatch transport if enabled
if (env.CLOUDWATCH_ENABLED) {
  logger.add(new CloudWatchTransport({
    logGroupName: '/aws/notespot/backend',
    logStreamName: `${os.hostname()}-${new Date().toISOString().split('T')[0]}`,
    awsRegion: env.AWS_REGION,
    awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
    awsSecretKey: env.AWS_SECRET_ACCESS_KEY,
    messageFormatter: (item) => {
      return JSON.stringify({
        level: item.level,
        message: item.message,
        timestamp: item.timestamp,
        environment: env.NODE_ENV,
        instanceId: os.hostname(),
        ...item.meta
      });
    }
  }));
}

export { logger };