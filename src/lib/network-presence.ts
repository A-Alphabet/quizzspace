type ParticipantType = 'host' | 'player';

type PresenceEntry = {
  participantType: ParticipantType;
  playerId?: string;
  latencyMs: number;
  lastSeenAt: number;
};

type PresenceStatus = 'ok' | 'delay' | 'offline';

export type NetworkParticipant = {
  participantType: ParticipantType;
  playerId?: string;
  latencyMs: number;
  lastSeenAt: number;
  status: PresenceStatus;
};

export type NetworkSnapshot = {
  host: NetworkParticipant | null;
  players: NetworkParticipant[];
  delayedCount: number;
};

const presenceByCode = new Map<string, Map<string, PresenceEntry>>();

const DELAY_THRESHOLD_MS = 1200;
const OFFLINE_THRESHOLD_MS = 45_000;
const CLEANUP_THRESHOLD_MS = 120_000;

function getKey(participantType: ParticipantType, playerId?: string): string {
  return participantType === 'host' ? 'host' : `player:${playerId}`;
}

function computeStatus(entry: PresenceEntry, now: number): PresenceStatus {
  const ageMs = now - entry.lastSeenAt;
  if (ageMs > OFFLINE_THRESHOLD_MS) {
    return 'offline';
  }

  if (entry.latencyMs >= DELAY_THRESHOLD_MS) {
    return 'delay';
  }

  return 'ok';
}

export function reportNetworkPresence(
  code: string,
  participantType: ParticipantType,
  latencyMs: number,
  playerId?: string
): NetworkSnapshot {
  const now = Date.now();
  const boundedLatency = Math.max(0, Math.min(Math.round(latencyMs), 30_000));

  let roomPresence = presenceByCode.get(code);
  if (!roomPresence) {
    roomPresence = new Map<string, PresenceEntry>();
    presenceByCode.set(code, roomPresence);
  }

  const key = getKey(participantType, playerId);
  roomPresence.set(key, {
    participantType,
    playerId,
    latencyMs: boundedLatency,
    lastSeenAt: now,
  });

  return getNetworkSnapshot(code);
}

export function getNetworkSnapshot(code: string): NetworkSnapshot {
  const now = Date.now();
  const roomPresence = presenceByCode.get(code);

  if (!roomPresence) {
    return {
      host: null,
      players: [],
      delayedCount: 0,
    };
  }

  for (const [key, entry] of roomPresence.entries()) {
    if (now - entry.lastSeenAt > CLEANUP_THRESHOLD_MS) {
      roomPresence.delete(key);
    }
  }

  if (roomPresence.size === 0) {
    presenceByCode.delete(code);
    return {
      host: null,
      players: [],
      delayedCount: 0,
    };
  }

  let host: NetworkParticipant | null = null;
  const players: NetworkParticipant[] = [];
  let delayedCount = 0;

  for (const entry of roomPresence.values()) {
    const status = computeStatus(entry, now);
    const participant: NetworkParticipant = {
      participantType: entry.participantType,
      playerId: entry.playerId,
      latencyMs: entry.latencyMs,
      lastSeenAt: entry.lastSeenAt,
      status,
    };

    if (status !== 'ok') {
      delayedCount += 1;
    }

    if (entry.participantType === 'host') {
      host = participant;
    } else {
      players.push(participant);
    }
  }

  players.sort((a, b) => {
    const aId = a.playerId ?? '';
    const bId = b.playerId ?? '';
    return aId.localeCompare(bId);
  });

  return {
    host,
    players,
    delayedCount,
  };
}
