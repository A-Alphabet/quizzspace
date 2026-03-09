import Ably from 'ably';
import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

type RealtimeDiagnostics = {
  status: 'ok' | 'degraded';
  checks: {
    configured: boolean;
    authSigning: 'ok' | 'failed' | 'not-configured';
  };
  checkedAt: string;
  cacheTtlSeconds: number;
};

let cachedDiagnostics: RealtimeDiagnostics | null = null;
let cacheExpiresAt = 0;

const DIAGNOSTICS_TTL_MS = 60_000;

async function buildDiagnostics(): Promise<RealtimeDiagnostics> {
  const env = getEnv();
  const rawKey = env.ABLY_API_KEY?.trim() ?? '';
  const configured = rawKey.length > 0;

  if (!configured) {
    return {
      status: 'degraded',
      checks: {
        configured: false,
        authSigning: 'not-configured',
      },
      checkedAt: new Date().toISOString(),
      cacheTtlSeconds: Math.round(DIAGNOSTICS_TTL_MS / 1000),
    };
  }

  try {
    // This validates key format and token-signing capability without joining channels.
    const rest = new Ably.Rest(rawKey);
    await rest.auth.createTokenRequest({
      clientId: `diag-${crypto.randomUUID()}`,
    });

    return {
      status: 'ok',
      checks: {
        configured: true,
        authSigning: 'ok',
      },
      checkedAt: new Date().toISOString(),
      cacheTtlSeconds: Math.round(DIAGNOSTICS_TTL_MS / 1000),
    };
  } catch {
    return {
      status: 'degraded',
      checks: {
        configured: true,
        authSigning: 'failed',
      },
      checkedAt: new Date().toISOString(),
      cacheTtlSeconds: Math.round(DIAGNOSTICS_TTL_MS / 1000),
    };
  }
}

export async function GET() {
  const now = Date.now();
  if (cachedDiagnostics && cacheExpiresAt > now) {
    return NextResponse.json(cachedDiagnostics, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  }

  const diagnostics = await buildDiagnostics();
  cachedDiagnostics = diagnostics;
  cacheExpiresAt = now + DIAGNOSTICS_TTL_MS;

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
    },
  });
}
