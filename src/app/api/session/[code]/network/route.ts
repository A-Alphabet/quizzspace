import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-errors';
import { isValidCode } from '@/lib/game-logic';
import { getNetworkSnapshot, reportNetworkPresence } from '@/lib/network-presence';

type ParticipantType = 'host' | 'player';

function parseParticipantType(value: unknown): ParticipantType | null {
  return value === 'host' || value === 'player' ? value : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!isValidCode(code)) {
    return successResponse({ error: 'Invalid join code' }, 400);
  }

  return successResponse(getNetworkSnapshot(code));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!isValidCode(code)) {
    return successResponse({ error: 'Invalid join code' }, 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return successResponse({ error: 'Invalid JSON body' }, 400);
  }

  const payload = body as {
    participantType?: unknown;
    playerId?: unknown;
    latencyMs?: unknown;
  };

  const participantType = parseParticipantType(payload.participantType);
  if (!participantType) {
    return successResponse({ error: 'participantType must be host or player' }, 400);
  }

  const latencyMs = Number(payload.latencyMs);
  if (!Number.isFinite(latencyMs)) {
    return successResponse({ error: 'latencyMs must be a number' }, 400);
  }

  const playerId = typeof payload.playerId === 'string' ? payload.playerId : undefined;
  if (participantType === 'player' && !playerId) {
    return successResponse({ error: 'playerId is required for player reports' }, 400);
  }

  const snapshot = reportNetworkPresence(code, participantType, latencyMs, playerId);
  return successResponse(snapshot);
}
