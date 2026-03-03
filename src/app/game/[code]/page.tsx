'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Alert } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  timerSeconds: number;
  choices: Choice[];
}

interface SessionData {
  id: string;
  joinCode: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  quiz: {
    id: string;
    title: string;
    questions: Question[];
  };
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { currentPlayer, gamePhase, setGamePhase, hasSubmittedAnswer, setHasSubmittedAnswer } =
    useGame();

  const code = params.code as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeStarted, setTimeStarted] = useState<number>(0);

  // Fetch session data
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

        if (data.status === 'finished') {
          setGamePhase('finished');
          router.push(`/results/${code}`);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setError('Failed to load session');
      }
    };

    fetchSession();
    const sessionInterval = setInterval(fetchSession, 3000);
    return () => clearInterval(sessionInterval);
  }, [code, currentPlayer, router, setGamePhase]);

  // Handle timer countdown
  useEffect(() => {
    if (!session) return;

    const currentQuestion = session.quiz.questions[session.currentQuestionIndex];
    if (!currentQuestion || hasSubmittedAnswer) return;

    if (timeStarted === 0) {
      setTimeStarted(Date.now());
      setTimeLeft(currentQuestion.timerSeconds);
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timeStarted) / 1000);
      const remaining = Math.max(0, currentQuestion.timerSeconds - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (!hasSubmittedAnswer && selectedChoiceId) {
          handleSubmitAnswer();
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [session, timeStarted, hasSubmittedAnswer, selectedChoiceId]);

  const handleSubmitAnswer = async () => {
    if (!selectedChoiceId || !currentPlayer || !session) return;

    const currentQuestion = session.quiz.questions[session.currentQuestionIndex];
    const timeTaken = Date.now() - timeStarted;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: currentPlayer.id,
          questionId: currentQuestion.id,
          selectedChoiceId,
          timeTaken,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      setHasSubmittedAnswer(true);
      setGamePhase('leaderboard');
    } catch (err) {
      setError('Failed to submit answer');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  const currentQuestion = session.quiz.questions[session.currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Alert variant="info">Waiting for next question...</Alert>
        </Card>
      </div>
    );
  }

  const isAnswerLocked = hasSubmittedAnswer || timeLeft === 0;
  const timerColor =
    timeLeft > 10 ? 'text-green-600' : timeLeft > 5 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {session.quiz.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Question {session.currentQuestionIndex + 1} of {session.quiz.questions.length}
            </p>
          </div>

          {/* Timer */}
          <div className={`text-4xl font-bold font-mono ${timerColor}`}>
            {timeLeft}s
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Question Card */}
        <Card className="shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">
            {currentQuestion.text}
          </h2>

          {/* Answer Choices */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={isAnswerLocked}
                onClick={() => !isAnswerLocked && setSelectedChoiceId(choice.id)}
                className={`w-full p-4 rounded-lg font-medium transition-all text-left ${
                  selectedChoiceId === choice.id
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isAnswerLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                aria-pressed={selectedChoiceId === choice.id}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedChoiceId === choice.id
                        ? 'border-white bg-white'
                        : 'border-slate-400 dark:border-slate-500'
                    }`}
                  >
                    {selectedChoiceId === choice.id && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  {choice.text}
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!isAnswerLocked ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-8"
              disabled={!selectedChoiceId || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleSubmitAnswer}
            >
              Submit Answer
            </Button>
          ) : (
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                {hasSubmittedAnswer ? '✓ Answer submitted' : '⏱ Time\'s up'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Waiting for next question...
              </p>
            </div>
          )}
        </Card>

        {/* Leaderboard Preview */}
        <Card className="shadow-xl">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">
            Current Leaderboard
          </h3>
          <div className="space-y-2">
            {session.players
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-2 rounded ${
                    player.id === currentPlayer.id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    #{idx + 1} {player.name}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {player.score}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
