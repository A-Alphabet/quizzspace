'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Alert } from '@/components/ui';
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
  currentQuestionIndex: number;
  quiz: {
    id: string;
    title: string;
    questions: Array<{ id: string }>;
  };
  players: Player[];
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { currentPlayer, gamePhase, setGamePhase } = useGame();

  const code = params.code as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Poll for session updates
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

        // If game starts, redirect to game page
        if (data.status === 'active') {
          setGamePhase('question');
          router.push(`/game/${code}`);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to load session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Poll every 2 seconds
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [code, currentPlayer, router, setGamePhase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md shadow-xl text-center">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
            Joining Quiz...
          </h2>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-md shadow-xl">
          <Alert variant="error">
            Session not found. Please check your join code and try again.
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {session.quiz.title}
          </h1>
          <div className="inline-block bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 tracking-widest">
              {code}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            Welcome, {currentPlayer?.name}!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Waiting for the host to start the game...
          </p>

          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Players joined ({session.players.length}):
            </p>
            <ul className="space-y-1">
              {session.players.map((player) => (
                <li
                  key={player.id}
                  className="text-sm text-slate-700 dark:text-slate-300 flex items-center"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {player.name}
                  {player.id === currentPlayer?.id && (
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      You
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Live Lobby
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Quiz has {session.quiz.questions.length} questions
          </p>
        </div>
      </Card>
    </div>
  );
}
