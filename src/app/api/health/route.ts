import { successResponse, handleErrorResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';
import { getLoadBalancerStats } from '@/lib/load-balancer';

export async function GET() {
  try {
    const env = getEnv();

    await prisma.$queryRaw`SELECT 1`;

    const realtimeConfigured = Boolean(env.ABLY_API_KEY);

    const loadBalancer = getLoadBalancerStats();

    return successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        realtime: realtimeConfigured ? 'configured' : 'polling-fallback',
        adminAuth: env.MASTER_PASSWORD ? 'configured' : 'not-configured',
      },
      loadBalancer,
    });
  } catch (error) {
    return handleErrorResponse(error);
  }
}
