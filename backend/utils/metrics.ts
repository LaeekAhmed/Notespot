import { PutMetricDataCommand, CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { env } from '../config/env';
import os from 'os';

// CloudWatch client for metrics
const cloudwatchClient = new CloudWatchClient({
  region: env.AWS_REGION,
  // access key and secret key are picked up by the AWS SDK from the Lambda IAM role or the local environment
});

export class MetricsService {
  private static instance: MetricsService;
  private metricsBuffer: any[] = [];
  private flushInterval: NodeJS.Timeout;
  private instanceId: string;

  private constructor() {
    // Generate unique instance ID
    this.instanceId = `${os.hostname()}`;

    // Flush metrics every 60 seconds to minimize API calls
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, 60000);
  }

  /* 
  Singleton instance
  Ensures only one instance of the class is created and shared across the application
  */
  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private async flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    try {
      const command = new PutMetricDataCommand({
        Namespace: 'notespot/backend',
        MetricData: this.metricsBuffer.map(metric => ({
          ...metric,
          Dimensions: [
            ...metric.Dimensions,
            { Name: 'InstanceId', Value: this.instanceId },
            { Name: 'Environment', Value: env.NODE_ENV },
          ],
        })),
      });

      await cloudwatchClient.send(command);
      this.metricsBuffer = []; // clear the metrics buffer after sending to CloudWatch
    } catch (error) {
      console.error('Failed to send metrics to CloudWatch:', error);
    }
  }

  // Record HTTP request metrics
  recordRequest(method: string, statusCode: number, duration: number) {
    const timestamp = new Date();

    // Request count
    this.metricsBuffer.push({
      MetricName: 'RequestCount',
      Value: 1,
      Unit: 'Count',
      Dimensions: [
        { Name: 'Method', Value: method },
        { Name: 'StatusCode', Value: statusCode.toString() },
      ],
      Timestamp: timestamp,
    });

    // Response time
    this.metricsBuffer.push({
      MetricName: 'ResponseTime',
      Value: duration,
      Unit: 'Milliseconds',
      Dimensions: [
        { Name: 'Method', Value: method },
        { Name: 'StatusCode', Value: statusCode.toString() },
      ],
      Timestamp: timestamp,
    });
  }

  // Cleanup
  destroy() {
    clearInterval(this.flushInterval);
  }
}

export const metricsService = MetricsService.getInstance();