'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonMatchCard } from '@/components/ui/skeleton';
import { NoMatchesScheduled } from '@/components/EmptyState';
import { generateRefereeSlug, type TodaysRefereeAssignment } from '@/lib/api-football';
import { cn } from '@/lib/utils';

interface TodaysRefereesProps {
  initialAssignments?: TodaysRefereeAssignment[];
}

// Memoized match card component
interface MatchCardProps {
  assignment: TodaysRefereeAssignment;
}

const MatchCard = memo(function MatchCard({ assignment }: MatchCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg",
        "bg-secondary/50 hover:bg-secondary transition-colors",
        "focus-within:ring-2 focus-within:ring-ring"
      )}
    >
      {/* Time and League */}
      <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:w-20 shrink-0">
        <time className="text-lg font-bold" dateTime={assignment.fixture.time}>
          {assignment.fixture.time}
        </time>
        <span className="text-xs text-muted-foreground">{assignment.fixture.league}</span>
      </div>

      {/* Teams */}
      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {assignment.fixture.homeLogo && (
            <Image
              src={assignment.fixture.homeLogo}
              alt={assignment.fixture.homeTeam}
              width={24}
              height={24}
              className="w-6 h-6 object-contain shrink-0"
            />
          )}
          <span className="text-sm font-medium truncate">{assignment.fixture.homeTeam}</span>
        </div>
        <span className="text-muted-foreground text-sm shrink-0" aria-hidden="true">vs</span>
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="text-sm font-medium truncate">{assignment.fixture.awayTeam}</span>
          {assignment.fixture.awayLogo && (
            <Image
              src={assignment.fixture.awayLogo}
              alt={assignment.fixture.awayTeam}
              width={24}
              height={24}
              className="w-6 h-6 object-contain shrink-0"
            />
          )}
        </div>
      </div>

      {/* Referee */}
      <div className="sm:w-40 shrink-0">
        {assignment.referee === 'TBA' ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>TBA</span>
          </span>
        ) : (
          <Link
            href={`/referees/${generateRefereeSlug(assignment.referee)}`}
            className={cn(
              "inline-flex items-center gap-2 text-sm text-primary hover:underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            )}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="truncate">{assignment.referee}</span>
          </Link>
        )}
      </div>
    </article>
  );
});

export function TodaysReferees({ initialAssignments = [] }: TodaysRefereesProps) {
  const [assignments, setAssignments] = useState<TodaysRefereeAssignment[]>(initialAssignments);
  const [loading, setLoading] = useState(initialAssignments.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fixtures/today');
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError('Unable to load today\'s assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAssignments.length > 0) return;
    fetchAssignments();
  }, [initialAssignments, fetchAssignments]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Today&apos;s Referee Assignments</span>
          <time
            className="text-sm font-normal text-muted-foreground"
            dateTime={new Date().toISOString().split('T')[0]}
          >
            {today}
          </time>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4" role="status" aria-label="Loading today's matches">
            {[1, 2, 3].map((i) => (
              <SkeletonMatchCard key={i} />
            ))}
            <span className="sr-only">Loading today&apos;s referee assignments...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8" role="alert">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchAssignments}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && assignments.length === 0 && (
          <NoMatchesScheduled />
        )}

        {!loading && !error && assignments.length > 0 && (
          <div className="space-y-4" role="list" aria-label="Today's matches">
            {assignments.map((assignment) => (
              <MatchCard key={assignment.fixture.id} assignment={assignment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TodaysReferees;
