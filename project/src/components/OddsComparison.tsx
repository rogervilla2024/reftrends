'use client';

import { useMemo } from 'react';
import { calculateExpectedCards } from '@/lib/predictions';

interface OddsData {
  market: string;
  bookmakerOdds: number;
  bookmakerName?: string;
}

interface Props {
  refereeAvgYellow: number;
  refereeAvgRed: number;
  refereeMatches: number;
  homeTeamAvgYellow?: number;
  awayTeamAvgYellow?: number;
  bookmakerOdds?: OddsData[];
}

// Simulated bookmaker odds (in production, fetch from API)
const DEFAULT_ODDS: OddsData[] = [
  { market: 'Over 2.5 Cards', bookmakerOdds: 1.45, bookmakerName: 'Avg' },
  { market: 'Over 3.5 Cards', bookmakerOdds: 1.75, bookmakerName: 'Avg' },
  { market: 'Over 4.5 Cards', bookmakerOdds: 2.10, bookmakerName: 'Avg' },
  { market: 'Over 5.5 Cards', bookmakerOdds: 2.80, bookmakerName: 'Avg' },
  { market: 'Under 3.5 Cards', bookmakerOdds: 2.00, bookmakerName: 'Avg' },
  { market: 'Under 4.5 Cards', bookmakerOdds: 1.65, bookmakerName: 'Avg' },
];

export default function OddsComparison({
  refereeAvgYellow,
  refereeAvgRed,
  refereeMatches,
  homeTeamAvgYellow,
  awayTeamAvgYellow,
  bookmakerOdds = DEFAULT_ODDS,
}: Props) {
  const predictions = useMemo(() => {
    const refereeStats = {
      avgYellowCards: refereeAvgYellow,
      avgRedCards: refereeAvgRed,
      matchesOfficiated: refereeMatches,
      strictnessIndex: 5,
    };

    const homeTeam = homeTeamAvgYellow ? {
      avgYellowReceived: homeTeamAvgYellow,
      avgRedReceived: 0.05,
      avgFoulsCommitted: 12,
      matchesPlayed: 20,
    } : undefined;

    const awayTeam = awayTeamAvgYellow ? {
      avgYellowReceived: awayTeamAvgYellow,
      avgRedReceived: 0.05,
      avgFoulsCommitted: 12,
      matchesPlayed: 20,
    } : undefined;

    return calculateExpectedCards(refereeStats, homeTeam, awayTeam);
  }, [refereeAvgYellow, refereeAvgRed, refereeMatches, homeTeamAvgYellow, awayTeamAvgYellow]);

  // Calculate implied probability from bookmaker odds
  const impliedProbability = (odds: number) => (1 / odds) * 100;

  // Calculate our probability for each market
  const getOurProbability = (market: string): number => {
    if (market.includes('Over 2.5')) return predictions.over25Probability;
    if (market.includes('Over 3.5')) return predictions.over35Probability;
    if (market.includes('Over 4.5')) return predictions.over45Probability;
    if (market.includes('Over 5.5')) return predictions.over45Probability * 0.6; // Approximate
    if (market.includes('Under 3.5')) return predictions.under35Probability;
    if (market.includes('Under 4.5')) return 100 - predictions.over45Probability;
    return 50;
  };

  // Calculate fair odds from our probability
  const fairOdds = (probability: number) => probability > 0 ? 100 / probability : 99;

  // Calculate Expected Value
  const calculateEV = (ourProb: number, bookOdds: number): number => {
    const decimalProb = ourProb / 100;
    return (decimalProb * bookOdds) - 1;
  };

  const comparisons = useMemo(() => {
    return bookmakerOdds.map(odds => {
      const ourProb = getOurProbability(odds.market);
      const impliedProb = impliedProbability(odds.bookmakerOdds);
      const fair = fairOdds(ourProb);
      const ev = calculateEV(ourProb, odds.bookmakerOdds);
      const edge = ourProb - impliedProb;

      return {
        ...odds,
        ourProbability: ourProb,
        impliedProbability: impliedProb,
        fairOdds: fair,
        ev,
        edge,
        isValue: ev > 0.05, // 5%+ edge is value
      };
    });
  }, [bookmakerOdds, predictions]);

  const valueBets = comparisons.filter(c => c.isValue);

  return (
    <div className="space-y-6">
      {/* Expected Cards Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-primary/10 text-center">
          <div className="text-2xl font-bold text-primary">
            {predictions.expectedTotalCards.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Expected Cards</div>
        </div>
        <div className="p-4 rounded-xl bg-yellow-500/10 text-center">
          <div className="text-2xl font-bold text-yellow-500">
            {predictions.expectedYellowCards.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Expected Yellow</div>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-500">
            {predictions.expectedRedCards.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">Expected Red</div>
        </div>
      </div>

      {/* Value Bets Alert */}
      {valueBets.length > 0 && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500 text-xl">+EV</span>
            <span className="font-bold text-green-500">Value Bets Found!</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {valueBets.map(bet => (
              <div
                key={bet.market}
                className="px-3 py-2 rounded-lg bg-green-500/20 text-sm"
              >
                <span className="font-medium">{bet.market}</span>
                <span className="text-green-400 ml-2">
                  +{(bet.ev * 100).toFixed(1)}% EV
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Odds Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2">Market</th>
              <th className="text-center py-3 px-2">Bookmaker</th>
              <th className="text-center py-3 px-2">Implied %</th>
              <th className="text-center py-3 px-2">Our %</th>
              <th className="text-center py-3 px-2">Fair Odds</th>
              <th className="text-center py-3 px-2">Edge</th>
              <th className="text-center py-3 px-2">EV</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map(row => (
              <tr
                key={row.market}
                className={`border-b border-border/50 ${row.isValue ? 'bg-green-500/5' : ''}`}
              >
                <td className="py-3 px-2 font-medium">{row.market}</td>
                <td className="py-3 px-2 text-center font-mono">
                  {row.bookmakerOdds.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-center text-muted-foreground">
                  {row.impliedProbability.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center font-bold text-primary">
                  {row.ourProbability.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center font-mono text-muted-foreground">
                  {row.fairOdds.toFixed(2)}
                </td>
                <td className={`py-3 px-2 text-center font-medium ${
                  row.edge > 5 ? 'text-green-500' :
                  row.edge > 0 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {row.edge > 0 ? '+' : ''}{row.edge.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.isValue ? 'bg-green-500/20 text-green-400' :
                    row.ev > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {row.ev > 0 ? '+' : ''}{(row.ev * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20"></div>
          <span>Value Bet (+5% EV)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/20"></div>
          <span>Marginal (+0-5% EV)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/20"></div>
          <span>No Value (Negative EV)</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
        <strong>Note:</strong> Odds shown are market averages. Always compare with your bookmaker for actual odds.
        EV = (Our Probability × Odds) - 1. Positive EV suggests long-term profit potential.
      </div>
    </div>
  );
}
