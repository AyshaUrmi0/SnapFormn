'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred.</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
