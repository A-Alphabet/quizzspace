import { Suspense } from 'react';
import { JoinPageContent } from './join-content';

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}

