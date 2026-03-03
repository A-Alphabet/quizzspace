'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Alert } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

interface QuizData {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  timerSeconds: number;
  choices: Choice[];
}

interface Choice {
  id: string;
  text: string;
}

interface SessionData {
  id: string;
  joinCode: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function HostDashboard() {
  const params = useParams();
  const router = useRouter();
  const { setSession, setIsHost } = useGame();

  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [session, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) throw new Error('Quiz not found');
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleCreateSession = async () => {
    if (!quiz) return;

    setIsStarting(true);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const newSession = await response.json();
      setSessionData(newSession);
      setSessionCreated(true);
      setIsHost(true);
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartGame = async () => {
    if (!session) return;

    setIsStarting(true);
    try {
      const response = await fetch('/api/session/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          sessionId: session.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to start game');

      const updatedSession = await response.json();
      setSessionData(updatedSession);
      router.push(`/game/${session.joinCode}`);
    } catch (err) {
      setError('Failed to start game. Please try again.');
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error">
          <p className="font-semibold">Quiz not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-2 text-blue-600 hover:underline"
          >
            Return home
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          ← Back to Home
        </button>

        <Card className="shadow-xl mb-6">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
            {quiz.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {quiz.questions.length} questions • Host Dashboard
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {!sessionCreated ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Get Started</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create a session to allow players to join with a join code.
              </p>

              <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                  How it works:
                </h3>
                <ol className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
                  <li>1. Create a session (generates a unique join code)</li>
                  <li>2. Share the code with players</li>
                  <li>3. Start when ready, then guide through questions</li>
                  <li>4. View live leaderboard during the game</li>
                </ol>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isStarting}
                onClick={handleCreateSession}
              >
                Create Session
              </Button>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg mb-6 border-l-4 border-green-500">
                <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                  Session Created!
                </h3>
                <p className="text-sm mb-3 text-slate-700 dark:text-slate-300">
                  Share this code with your players:
                </p>
                <div className="bg-white dark:bg-slate-800 p-4 rounded text-3xl font-bold text-center tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                  {session?.joinCode}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Players joined: <span className="font-bold">{session?.players?.length ?? 0}</span>
                </p>
              </div>

              {session && session.status === 'waiting' && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  isLoading={isStarting}
                  onClick={handleStartGame}
                >
                  Start Game
                </Button>
              )}

              {session && session.status !== 'waiting' && (
                <p className="text-center text-slate-600 dark:text-slate-400">
                  Game is {session.status === 'active' ? 'in progress' : 'finished'}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Quiz Overview */}
        <Card className="shadow-xl">
          <h2 className="text-xl font-bold mb -4 text-slate-900 dark:text-white">
            Quiz Overview
          </h2>
          <div className="space-y-3">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-3 rounded bg-slate-50 dark:bg-slate-700">
                <p className="font-medium text-sm text-slate-900 dark:text-white">
                  Q{idx + 1}: {q.text}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {q.timerSeconds}s • {q.choices.length} choices
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
