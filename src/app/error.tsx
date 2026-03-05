'use client';

import { useEffect } from 'react';
import { Button, Card, Alert } from '@/components/ui';

const RETRY_KEY = 'route_error_autoreload';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const route = window.location.pathname;
    const key = `${RETRY_KEY}:${route}`;
    const last = Number.parseInt(sessionStorage.getItem(key) || '0', 10);

    // Auto-reload once for transient app-router/render races.
    if (!Number.isNaN(last) && now - last < 5000) {
      return;
    }

    sessionStorage.setItem(key, String(now));
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [reset]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-red-50 to-pink-100 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl animate-scale-in animate-pop-in">
        <Alert variant="error" className="mb-4 animate-slide-up">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm mt-1">An unexpected error occurred while loading this page.</p>
        </Alert>
        <div className="flex gap-2 animate-slide-up animate-delay-100">
          <Button variant="secondary" className="flex-1" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
