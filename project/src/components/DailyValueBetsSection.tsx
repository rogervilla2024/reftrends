'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DailyValueBets = dynamic(() => import('./DailyValueBets'), {
  loading: () => (
    <div className="h-64 flex items-center justify-center text-muted-foreground">
      Loading value bets...
    </div>
  ),
});

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  kickoff: string;
  league: string;
  leagueLogo?: string;
  referee?: {
    name: string;
    slug: string;
    avgYellowCards: number;
    avgRedCards: number;
    matchesOfficiated: number;
    strictnessIndex: number;
  };
}

export default function DailyValueBetsSection() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch('/api/value-bets', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setFixtures(data.fixtures || []);
        setIsUpcoming(data.isUpcoming || false);
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError('Failed to load value bets');
        console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="animate-pulse mb-2">Loading value bets...</div>
            <div className="text-sm">Analyzing today&apos;s matches</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't break the homepage
  }

  // Filter fixtures that have referees assigned
  const fixturesWithReferees = fixtures.filter(f => f.referee);

  if (fixturesWithReferees.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="text-center p-8 rounded-xl bg-secondary/20">
          <h2 className="text-2xl font-bold mb-2">Value Bets</h2>
          <p className="text-muted-foreground">
            {isUpcoming
              ? 'No referee assignments available for upcoming matches yet.'
              : 'No matches with referee assignments today. Check back tomorrow!'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8" aria-label="Daily value bets">
      <DailyValueBets fixtures={fixturesWithReferees} />
    </section>
  );
}
