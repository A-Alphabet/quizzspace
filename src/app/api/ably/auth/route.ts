import Ably from 'ably';
import { successResponse } from '@/lib/api-errors';
import { getEnv } from '@/lib/env';

export async function GET() {
  const env = getEnv();

  if (!env.ABLY_API_KEY) {
    return successResponse({ error: 'Real-time is not configured' }, 503);
  }

  try {
    const ably = new Ably.Rest(env.ABLY_API_KEY);
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: `client-${crypto.randomUUID()}`,
    });

    return successResponse(tokenRequest);
  } catch (error) {
    console.error('Failed to create Ably token request:', error);
    return successResponse({ error: 'Real-time is temporarily unavailable' }, 503);
  }
}
