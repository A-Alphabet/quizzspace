'use client';

import { useState } from 'react';
import { Button, Input, Card, Alert } from '@/components/ui';

interface TOTPModalProps {
  onSuccess: () => void;
}

export function TOTPModal({ onSuccess }: TOTPModalProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.valid) {
        onSuccess();
      } else {
        setError(data.error || 'Invalid authentication code. Please try again.');
        setToken('');
      }
    } catch (err) {
      setError('Error verifying token. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Master Password Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your authentication code to create a new quiz
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Authentication Code
          </label>
          <Input
            type="text"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
            disabled={isVerifying}
            autoFocus
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Use your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isVerifying}
          onClick={handleVerify}
          disabled={token.length !== 6}
        >
          Verify Code
        </Button>
      </Card>
    </div>
  );
}
