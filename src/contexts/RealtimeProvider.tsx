'use client';

import { useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { useGame } from './GameContext';

type PlayerRemovedEvent = {
  playerId?: string;
};

type AblyMessage = {
  data?: unknown;
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const realtimeRef = useRef<Ably.Realtime | null>(null);
  const pendingRefreshTimeoutRef = useRef<number | null>(null);
  const sessionEtagRef = useRef<string | null>(null);
  const { session, setSession, setGamePhase, isHost } = useGame();

  useEffect(() => {
    if (!realtimeRef.current && typeof window !== 'undefined') {
      try {
        realtimeRef.current = new Ably.Realtime({
          authUrl: '/api/ably/auth',
        });
      } catch (err) {
        console.error('Failed to initialize Ably:', err);
        realtimeRef.current = null;
      }
    }

    return () => {
      if (realtimeRef.current && session) {
        const channelName = `session-${session.joinCode}`;
        const channel = realtimeRef.current.channels.get(channelName);
        channel.unsubscribe();
        realtimeRef.current.channels.release(channelName);
      }
    };
  }, [session]);

  // Subscribe to session channel when session is available
  useEffect(() => {
    if (!realtimeRef.current || !session) return;
    sessionEtagRef.current = null;

    try {
      const channelName = `session-${session.joinCode}`;
      const channel = realtimeRef.current.channels.get(channelName);

      // Fetch updated session data from API
      const fetchUpdatedSession = async () => {
        try {
          const response = await fetch(`/api/session/${session.joinCode}`, {
            headers: sessionEtagRef.current
              ? { 'If-None-Match': sessionEtagRef.current }
              : undefined,
          });

          if (response.status === 304) {
            return;
          }

          if (!response.ok) {
            throw new Error(`Session refresh failed (${response.status})`);
          }

          const nextEtag = response.headers.get('etag');
          if (nextEtag) {
            sessionEtagRef.current = nextEtag;
          }

          const updatedSession = await response.json();
          setSession(updatedSession);
        } catch (err) {
          console.error('Failed to fetch updated session:', err);
        }
      };

      const scheduleSessionRefresh = () => {
        if (pendingRefreshTimeoutRef.current !== null) {
          window.clearTimeout(pendingRefreshTimeoutRef.current);
        }

        pendingRefreshTimeoutRef.current = window.setTimeout(() => {
          pendingRefreshTimeoutRef.current = null;
          fetchUpdatedSession();
        }, 150);
      };

      const onPlayerJoined = (message: AblyMessage) => {
        console.log('Player joined:', message.data);
        scheduleSessionRefresh();
      };

      const onPlayerRemoved = (message: AblyMessage) => {
        const data = (message.data ?? {}) as PlayerRemovedEvent;
        console.log('Player removed:', data);
        scheduleSessionRefresh();
        // If current player was removed, redirect to home
        if (data.playerId === sessionStorage.getItem('currentPlayerId')) {
          alert('You have been removed from the session by the host.');
          window.location.href = '/';
        }
      };

      const onQuestionStart = (message: AblyMessage) => {
        console.log('Question started:', message.data);
        scheduleSessionRefresh();
        if (isHost) {
          setGamePhase('question');
        }
      };

      const onLeaderboardUpdate = (message: AblyMessage) => {
        console.log('Leaderboard updated:', message.data);
        scheduleSessionRefresh();
        if (isHost) {
          setGamePhase('leaderboard');
        }
      };

      const onGameOver = (message: AblyMessage) => {
        console.log('Game over:', message.data);
        scheduleSessionRefresh();
        if (isHost) {
          setGamePhase('finished');
        }
      };

      channel.subscribe('player_joined', onPlayerJoined);
      channel.subscribe('player_removed', onPlayerRemoved);
      channel.subscribe('question_start', onQuestionStart);
      channel.subscribe('leaderboard_update', onLeaderboardUpdate);
      channel.subscribe('game_over', onGameOver);

      return () => {
        if (pendingRefreshTimeoutRef.current !== null) {
          window.clearTimeout(pendingRefreshTimeoutRef.current);
          pendingRefreshTimeoutRef.current = null;
        }
        channel.unsubscribe('player_joined', onPlayerJoined);
        channel.unsubscribe('player_removed', onPlayerRemoved);
        channel.unsubscribe('question_start', onQuestionStart);
        channel.unsubscribe('leaderboard_update', onLeaderboardUpdate);
        channel.unsubscribe('game_over', onGameOver);
      };
    } catch (err) {
      console.error('Failed to subscribe to Ably channel:', err);
      // Continue without realtime - polling will handle updates
    }
  }, [session, setSession, setGamePhase, isHost]);

  // In a production app, you'd pass realtimeRef.current through context
  // For MVP, we're relying on polling for now
  return <>{children}</>;
}
