'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface IQuestion {
  id: string;
  text: string;
  timerSeconds: number;
  orderIndex: number;
  choices: IChoice[];
}

export interface IChoice {
  id: string;
  text: string;
  isCorrect?: boolean; // Only on server, not in responses to clients
}

export interface IPlayer {
  id: string;
  name: string;
  score: number;
}

export interface IQuiz {
  id: string;
  title: string;
  questions: IQuestion[];
  createdAt: string;
}

export interface ISession {
  id: string;
  joinCode: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  quiz: IQuiz;
  players: IPlayer[];
  startedAt?: string;
  endedAt?: string;
}

interface GameContextType {
  // Session state
  session: ISession | null;
  setSession: (session: ISession | null) => void;

  // Player state
  currentPlayer: IPlayer | null;
  setCurrentPlayer: (player: IPlayer | null) => void;

  // UI state
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;

  // Leaderboard
  leaderboard: IPlayer[];
  setLeaderboard: (leaderboard: IPlayer[]) => void;

  // Current question
  currentQuestion: IQuestion | null;

  // Game phase
  gamePhase: 'lobby' | 'question' | 'leaderboard' | 'finished';
  setGamePhase: (phase: 'lobby' | 'question' | 'leaderboard' | 'finished') => void;

  // Submission state
  hasSubmittedAnswer: boolean;
  setHasSubmittedAnswer: (submitted: boolean) => void;

  // Reset function
  reset: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ISession | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<IPlayer | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [leaderboard, setLeaderboard] = useState<IPlayer[]>([]);
  const [gamePhase, setGamePhase] = useState<GameContextType['gamePhase']>('lobby');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  const reset = useCallback(() => {
    setSession(null);
    setCurrentPlayer(null);
    setIsHost(false);
    setLeaderboard([]);
    setGamePhase('lobby');
    setHasSubmittedAnswer(false);
  }, []);

  const currentQuestion =
    session && session.currentQuestionIndex < session.quiz.questions.length
      ? session.quiz.questions[session.currentQuestionIndex]
      : null;

  return (
    <GameContext.Provider
      value={{
        session,
        setSession,
        currentPlayer,
        setCurrentPlayer,
        isHost,
        setIsHost,
        leaderboard,
        setLeaderboard,
        currentQuestion,
        gamePhase,
        setGamePhase,
        hasSubmittedAnswer,
        setHasSubmittedAnswer,
        reset,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
