'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface SessionData {
  id: string;
  joinCode: string;
  status: 'waiting' | 'active' | 'finished';
  quiz: {
    id: string;
    title: string;
  };
  players: Player[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentPlayer, reset } = useGame();

  const code = params.code as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentPlayer) {
      router.push('/');
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/${code}`);
        if (!response.ok) throw new Error('Session not found');

        const data: SessionData = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [code, currentPlayer, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-lg">Loading results...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error">Failed to load results</Alert>
      </div>
    );
  }

  const sortedPlayers = [...session.players].sort((a, b) => b.score - a.score);
  const playerRank = sortedPlayers.findIndex((p) => p.id === currentPlayer?.id) + 1;
  const playerScore = currentPlayer ? sortedPlayers.find((p) => p.id === currentPlayer.id)?.score || 0 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quiz Complete!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {session.quiz.title}
          </p>

          {currentPlayer && (
            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your Rank</p>
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                #{playerRank}
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {playerScore} points
              </p>
            </div>
          )}
        </Card>

        {/* Final Leaderboard */}
        <Card className="shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
            Final Leaderboard
          </h2>

          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const medal = idx < 3 ? medals[idx] : '  ';
              const isCurrentPlayer = player.id === currentPlayer?.id;

              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-3 rounded-lg font-medium ${
                    isCurrentPlayer
                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl w-6">{medal}</span>
                    <p className="text-slate-900 dark:text-white">
                      #{idx + 1} {player.name}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {player.score}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              reset();
              router.push('/');
            }}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              reset();
              router.push('/create-quiz');
            }}
          >
            Create Another Quiz
          </Button>
        </div>

        {/* Share Results */}
        <Card className="shadow-xl mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Share this quiz with your friends!
            </p>
            <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm text-slate-900 dark:text-white font-mono">
              {code}
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
}
