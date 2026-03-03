'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Alert, Button } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

export function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, setCurrentPlayer } = useGame();

  const code = (searchParams.get('code') || '').toUpperCase();
  const playerName = searchParams.get('name') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code || !playerName) {
      router.push('/');
      return;
    }

    handleJoinSession();
  }, [code, playerName]);

  const handleJoinSession = async () => {
    if (!code || !playerName) return;

    setIsLoading(true);
    setError('');

    try {
      // First, get session details
      const sessionRes = await fetch(`/api/session/${code}`);
      if (!sessionRes.ok) {
        throw new Error('Invalid join code or session not found');
      }
      const sessionData = await sessionRes.json();
      setSession(sessionData);

      // Then join as a player
      const joinRes = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          playerName: decodeURIComponent(playerName),
        }),
      });

      if (!joinRes.ok) {
        const errorData = await joinRes.json();
        throw new Error(errorData.error || 'Failed to join session');
      }

      const { player } = await joinRes.json();
      setCurrentPlayer(player);

      // Redirect to lobby
      router.push(`/lobby/${code}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to join session. Please try again.'
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Joining session...
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {code} as {playerName}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md shadow-xl">
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/')}
          >
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
