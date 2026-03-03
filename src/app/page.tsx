'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Input, Card, Tabs } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

export default function Home() {
  const { reset } = useGame();
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formattedCode = joinCode.toUpperCase().trim();

      if (!formattedCode || formattedCode.length !== 6) {
        setError('Join code must be 6 characters');
        return;
      }

      if (!playerName.trim()) {
        setError('Player name is required');
        return;
      }

      // Redirect to join page
      window.location.href = `/join?code=${formattedCode}&name=${encodeURIComponent(playerName)}`;
    } catch (err) {
      setError('Failed to join session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <a href="#main" className="skip-to-main">Skip to main content</a>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            LiveQuiz
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Real-time quiz platform for engaging learning
          </p>
        </div>

        <Card className="shadow-xl">
          <div className="space-y-6">
            {/* Tabs */}
            <Tabs
              tabs={[
                { label: 'Join Quiz', value: 'join' },
                { label: 'Create Quiz', value: 'create' },
              ]}
              activeTab={activeTab}
              onTabChange={(value) => setActiveTab(value as 'join' | 'create')}
            />

            {/* Join Session Tab */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinSession} className="space-y-4">
                <Input
                  label="Join Code (6 digits)"
                  placeholder="e.g., ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={isLoading}
                  aria-label="Join code input"
                  error={error && joinCode && joinCode.length !== 6 ? 'Code must be 6 characters' : ''}
                />

                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  disabled={isLoading}
                  aria-label="Player name input"
                  error={error && !playerName ? 'Name is required' : ''}
                />

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Join Session
                </Button>
              </form>
            )}

            {/* Create Quiz Tab */}
            {activeTab === 'create' && (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Create a new quiz and become the host of a live session.
                </p>
                <Link href="/create-quiz" className="block">
                  <Button variant="secondary" size="lg" className="w-full">
                    Create New Quiz
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Made with care for educators and students
            </p>
          </div>
        </Card>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="font-semibold text-slate-900 dark:text-white">Real-time</p>
            <p className="text-slate-600 dark:text-slate-400">Instant feedback</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-semibold text-slate-900 dark:text-white">Scoreboard</p>
            <p className="text-slate-600 dark:text-slate-400">Live leaderboard</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-semibold text-slate-900 dark:text-white">Engaging</p>
            <p className="text-slate-600 dark:text-slate-400">Interactive learning</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <p className="font-semibold text-slate-900 dark:text-white">Mobile Ready</p>
            <p className="text-slate-600 dark:text-slate-400">Works anywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}
