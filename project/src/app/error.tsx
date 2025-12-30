'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto border-destructive/50">
        <CardContent className="py-12 text-center">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-10 h-10 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-muted-foreground mb-8">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} size="lg">
              Try Again
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
