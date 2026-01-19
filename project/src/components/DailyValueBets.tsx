'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateExpectedCards } from '@/lib/predictions';

interface FixtureData {
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

interface ValueBet {
  fixture: FixtureData;
  market: string;
  ourProbability: number;
  bookmakerOdds: number;
  impliedProbability: number;
  ev: number;
  confidence: 'high' | 'medium' | 'low';
  expectedCards: number;
}

interface Props {
  fixtures: FixtureData[];
}

// Simulated bookmaker odds for different markets
const getSimulatedOdds = (expectedCards: number) => {
  // Generate realistic odds based on expected cards
  const markets = [
    { name: 'Over 2.5 Cards', threshold: 2.5 },
    { name: 'Over 3.5 Cards', threshold: 3.5 },
    { name: 'Over 4.5 Cards', threshold: 4.5 },
    { name: 'Under 3.5 Cards', threshold: 3.5, isUnder: true },
    { name: 'Under 4.5 Cards', threshold: 4.5, isUnder: true },
  ];

  return markets.map(market => {
    // Add some randomness to simulate different bookmakers
    const baseOdds = market.isUnder
      ? expectedCards > market.threshold ? 1.5 + Math.random() * 0.5 : 2.2 + Math.random() * 0.6
      : expectedCards > market.threshold ? 1.5 + Math.random() * 0.5 : 2.2 + Math.random() * 0.6;

    return {
      market: market.name,
      odds: Math.round(baseOdds * 100) / 100,
      threshold: market.threshold,
      isUnder: market.isUnder || false,
    };
  });
};

export default function DailyValueBets({ fixtures }: Props) {
  const [sortBy, setSortBy] = useState<'ev' | 'confidence' | 'time'>('ev');
  const [minEV, setMinEV] = useState(5);

  // Calculate value bets for all fixtures
  const valueBets = useMemo(() => {
    const bets: ValueBet[] = [];

    fixtures.forEach(fixture => {
      if (!fixture.referee) return;

      // Calculate expected cards using prediction engine
      const refereeStats = {
        avgYellowCards: fixture.referee.avgYellowCards,
        avgRedCards: fixture.referee.avgRedCards,
        matchesOfficiated: fixture.referee.matchesOfficiated,
        strictnessIndex: fixture.referee.strictnessIndex,
      };

      const predictions = calculateExpectedCards(refereeStats);
      const expectedCards = predictions.expectedTotalCards;

      // Get simulated bookmaker odds
      const odds = getSimulatedOdds(expectedCards);

      // Check each market for value
      odds.forEach(oddsData => {
        let ourProbability: number;

        if (oddsData.isUnder) {
          ourProbability = oddsData.threshold === 3.5
            ? predictions.under35Probability
            : 100 - predictions.over45Probability;
        } else {
          if (oddsData.threshold === 2.5) ourProbability = predictions.over25Probability;
          else if (oddsData.threshold === 3.5) ourProbability = predictions.over35Probability;
          else ourProbability = predictions.over45Probability;
        }

        const impliedProbability = (1 / oddsData.odds) * 100;
        const ev = (ourProbability / 100 * oddsData.odds - 1) * 100;

        // Only include if EV is positive
        if (ev > 0) {
          bets.push({
            fixture,
            market: oddsData.market,
            ourProbability,
            bookmakerOdds: oddsData.odds,
            impliedProbability,
            ev,
            confidence: ev > 15 ? 'high' : ev > 8 ? 'medium' : 'low',
            expectedCards,
          });
        }
      });
    });

    return bets;
  }, [fixtures]);

  // Filter and sort value bets
  const filteredBets = useMemo(() => {
    let filtered = valueBets.filter(bet => bet.ev >= minEV);

    switch (sortBy) {
      case 'ev':
        return filtered.sort((a, b) => b.ev - a.ev);
      case 'confidence':
        const confOrder = { high: 3, medium: 2, low: 1 };
        return filtered.sort((a, b) => confOrder[b.confidence] - confOrder[a.confidence]);
      case 'time':
        return filtered.sort((a, b) =>
          new Date(a.fixture.kickoff).getTime() - new Date(b.fixture.kickoff).getTime()
        );
      default:
        return filtered;
    }
  }, [valueBets, sortBy, minEV]);

  // Group by confidence
  const highConfidence = filteredBets.filter(b => b.confidence === 'high');
  const mediumConfidence = filteredBets.filter(b => b.confidence === 'medium');

  if (fixtures.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-secondary/20 text-center">
        <div className="text-4xl mb-4 text-muted-foreground font-bold">--</div>
        <h3 className="font-bold text-xl mb-2">No Fixtures Today</h3>
        <p className="text-muted-foreground">
          Check back later for value bets on upcoming matches.
        </p>
      </div>
    );
  }

  if (filteredBets.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-secondary/20 text-center">
        <div className="text-4xl mb-4 text-muted-foreground font-bold">?</div>
        <h3 className="font-bold text-xl mb-2">No Value Bets Found</h3>
        <p className="text-muted-foreground">
          No positive EV opportunities detected for today&apos;s matches.
          Try lowering the minimum EV threshold.
        </p>
        <div className="mt-4">
          <label className="text-sm text-muted-foreground mr-2">Min EV:</label>
          <select
            value={minEV}
            onChange={(e) => setMinEV(Number(e.target.value))}
            className="px-3 py-1 rounded bg-secondary"
          >
            <option value={0}>0%</option>
            <option value={3}>3%</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Today&apos;s Value Bets
            <span className="text-sm px-2 py-1 rounded bg-green-500/20 text-green-400">
              {filteredBets.length} opportunities
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Positive EV bets based on referee statistics analysis
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-lg bg-secondary text-sm"
            aria-label="Sort value bets"
          >
            <option value="ev">Sort by EV</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="time">Sort by Kickoff</option>
          </select>
          <select
            value={minEV}
            onChange={(e) => setMinEV(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-secondary text-sm"
            aria-label="Minimum expected value filter"
          >
            <option value={0}>Min EV: 0%</option>
            <option value={3}>Min EV: 3%</option>
            <option value={5}>Min EV: 5%</option>
            <option value={10}>Min EV: 10%</option>
            <option value={15}>Min EV: 15%</option>
          </select>
        </div>
      </div>

      {/* High Confidence Bets */}
      {highConfidence.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            High Confidence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highConfidence.slice(0, 4).map((bet, idx) => (
              <ValueBetCard key={`high-${idx}`} bet={bet} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Confidence Bets */}
      {mediumConfidence.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            Medium Confidence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediumConfidence.slice(0, 6).map((bet, idx) => (
              <ValueBetCard key={`medium-${idx}`} bet={bet} compact />
            ))}
          </div>
        </div>
      )}

      {/* All Bets Table */}
      <div className="rounded-xl bg-secondary/20 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold">All Value Bets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Value bets comparison table">
            <thead>
              <tr className="bg-secondary/30">
                <th scope="col" className="text-left py-3 px-4">Match</th>
                <th scope="col" className="text-left py-3 px-4">Referee</th>
                <th scope="col" className="text-center py-3 px-4">Market</th>
                <th scope="col" className="text-center py-3 px-4">Odds</th>
                <th scope="col" className="text-center py-3 px-4">Our %</th>
                <th scope="col" className="text-center py-3 px-4">Implied %</th>
                <th scope="col" className="text-center py-3 px-4">EV</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-3 px-4">
                    <div className="font-medium">{bet.fixture.homeTeam} vs {bet.fixture.awayTeam}</div>
                    <div className="text-xs text-muted-foreground">{bet.fixture.league}</div>
                  </td>
                  <td className="py-3 px-4">
                    {bet.fixture.referee && (
                      <Link
                        href={`/referees/${bet.fixture.referee.slug}`}
                        className="text-primary hover:underline"
                      >
                        {bet.fixture.referee.name}
                      </Link>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bet.market.includes('Over') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {bet.market}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {bet.bookmakerOdds.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-primary">
                    {bet.ourProbability.toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {bet.impliedProbability.toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      bet.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                      bet.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      +{bet.ev.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/80">
        <strong>Disclaimer:</strong> These recommendations are based on historical statistics and simulated odds.
        Always verify current odds with your bookmaker. Past performance does not guarantee future results.
        Please gamble responsibly.
      </div>
    </div>
  );
}

// Value Bet Card Component
function ValueBetCard({ bet, compact = false }: { bet: ValueBet; compact?: boolean }) {
  return (
    <div className={`p-4 rounded-xl bg-secondary/30 border ${
      bet.confidence === 'high' ? 'border-green-500/30' : 'border-yellow-500/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">{bet.fixture.league}</div>
          <div className={`font-bold ${compact ? 'text-sm' : ''}`}>
            {bet.fixture.homeTeam} vs {bet.fixture.awayTeam}
          </div>
          {bet.fixture.referee && (
            <Link
              href={`/referees/${bet.fixture.referee.slug}`}
              className="text-xs text-primary hover:underline"
            >
              Ref: {bet.fixture.referee.name}
            </Link>
          )}
        </div>
        <div className={`px-3 py-2 rounded-lg text-center ${
          bet.confidence === 'high' ? 'bg-green-500/20' : 'bg-yellow-500/20'
        }`}>
          <div className={`font-bold ${
            bet.confidence === 'high' ? 'text-green-400' : 'text-yellow-400'
          } ${compact ? 'text-lg' : 'text-xl'}`}>
            +{bet.ev.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">EV</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs ${
            bet.market.includes('Over') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {bet.market}
          </span>
          <div className="text-right">
            <div className="font-mono font-bold">{bet.bookmakerOdds.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Our: {bet.ourProbability.toFixed(0)}% | Book: {bet.impliedProbability.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 text-xs text-muted-foreground">
          Expected: {bet.expectedCards.toFixed(1)} cards/match based on referee history
        </div>
      )}
    </div>
  );
}
