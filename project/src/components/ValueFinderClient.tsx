'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Match {
  id: number;
  date: string;
  homeTeam: { id: number; name: string; logo: string | null };
  awayTeam: { id: number; name: string; logo: string | null };
  league: string;
  referee: {
    id: number;
    name: string;
    slug: string;
    avgYellow: number;
    avgRed: number;
    matches: number;
  } | null;
}

interface TeamStats {
  [key: string]: { avgYellow: number };
}

interface Props {
  matches: Match[];
  teamStats: TeamStats;
}

interface OddsInput {
  matchId: number;
  over25: string;
  under25: string;
  over35: string;
  under35: string;
  over45: string;
  under45: string;
}

// Convert decimal odds to implied probability
function oddsToProb(odds: number): number {
  return odds > 0 ? (1 / odds) * 100 : 0;
}

// Poisson probability
function poissonProb(lambda: number, k: number): number {
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

// Calculate over probability
function calcOverProb(expected: number, line: number): number {
  let underProb = 0;
  for (let i = 0; i < line; i++) {
    underProb += poissonProb(expected, i);
  }
  return (1 - underProb) * 100;
}

export default function ValueFinderClient({ matches, teamStats }: Props) {
  const [oddsInputs, setOddsInputs] = useState<Record<number, OddsInput>>({});
  const [showOnlyValue, setShowOnlyValue] = useState(false);

  const updateOdds = (matchId: number, field: keyof OddsInput, value: string) => {
    setOddsInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        matchId,
        [field]: value,
      },
    }));
  };

  const calculations = useMemo(() => {
    return matches.map(match => {
      if (!match.referee) return { match, prediction: null, values: [] };

      // Calculate expected yellow cards
      const homeAvg = teamStats[match.homeTeam.id]?.avgYellow || 1.5;
      const awayAvg = teamStats[match.awayTeam.id]?.avgYellow || 1.5;
      const refAvg = match.referee.avgYellow;

      // Weighted: 50% referee, 25% home team, 25% away team
      const expectedYellow = refAvg * 0.5 + homeAvg * 0.25 + awayAvg * 0.25;

      // Our probabilities
      const ourOver25 = calcOverProb(expectedYellow, 3);
      const ourOver35 = calcOverProb(expectedYellow, 4);
      const ourOver45 = calcOverProb(expectedYellow, 5);

      const odds = oddsInputs[match.id];
      const values: Array<{
        market: string;
        ourProb: number;
        impliedProb: number;
        odds: number;
        ev: number;
        isValue: boolean;
      }> = [];

      if (odds) {
        // Over 2.5
        if (odds.over25 && parseFloat(odds.over25) > 1) {
          const bookOdds = parseFloat(odds.over25);
          const impliedProb = oddsToProb(bookOdds);
          const ev = (ourOver25 / 100) * bookOdds - 1;
          values.push({
            market: 'Over 2.5 Yellow',
            ourProb: ourOver25,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourOver25 > impliedProb,
          });
        }
        if (odds.under25 && parseFloat(odds.under25) > 1) {
          const bookOdds = parseFloat(odds.under25);
          const impliedProb = oddsToProb(bookOdds);
          const ourUnder = 100 - ourOver25;
          const ev = (ourUnder / 100) * bookOdds - 1;
          values.push({
            market: 'Under 2.5 Yellow',
            ourProb: ourUnder,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourUnder > impliedProb,
          });
        }

        // Over 3.5
        if (odds.over35 && parseFloat(odds.over35) > 1) {
          const bookOdds = parseFloat(odds.over35);
          const impliedProb = oddsToProb(bookOdds);
          const ev = (ourOver35 / 100) * bookOdds - 1;
          values.push({
            market: 'Over 3.5 Yellow',
            ourProb: ourOver35,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourOver35 > impliedProb,
          });
        }
        if (odds.under35 && parseFloat(odds.under35) > 1) {
          const bookOdds = parseFloat(odds.under35);
          const impliedProb = oddsToProb(bookOdds);
          const ourUnder = 100 - ourOver35;
          const ev = (ourUnder / 100) * bookOdds - 1;
          values.push({
            market: 'Under 3.5 Yellow',
            ourProb: ourUnder,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourUnder > impliedProb,
          });
        }

        // Over 4.5
        if (odds.over45 && parseFloat(odds.over45) > 1) {
          const bookOdds = parseFloat(odds.over45);
          const impliedProb = oddsToProb(bookOdds);
          const ev = (ourOver45 / 100) * bookOdds - 1;
          values.push({
            market: 'Over 4.5 Yellow',
            ourProb: ourOver45,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourOver45 > impliedProb,
          });
        }
        if (odds.under45 && parseFloat(odds.under45) > 1) {
          const bookOdds = parseFloat(odds.under45);
          const impliedProb = oddsToProb(bookOdds);
          const ourUnder = 100 - ourOver45;
          const ev = (ourUnder / 100) * bookOdds - 1;
          values.push({
            market: 'Under 4.5 Yellow',
            ourProb: ourUnder,
            impliedProb,
            odds: bookOdds,
            ev: ev * 100,
            isValue: ourUnder > impliedProb,
          });
        }
      }

      return {
        match,
        prediction: {
          expectedYellow,
          over25: ourOver25,
          over35: ourOver35,
          over45: ourOver45,
        },
        values,
      };
    });
  }, [matches, teamStats, oddsInputs]);

  const valueBets = calculations.flatMap(c =>
    c.values.filter(v => v.isValue && v.ev > 5).map(v => ({ ...v, match: c.match }))
  ).sort((a, b) => b.ev - a.ev);

  const displayCalcs = showOnlyValue
    ? calculations.filter(c => c.values.some(v => v.isValue && v.ev > 5))
    : calculations;

  return (
    <div className="space-y-6">
      {/* Value Bets Summary */}
      {valueBets.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Value Bets Found ({valueBets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {valueBets.slice(0, 5).map((bet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="font-medium">{bet.match.homeTeam.name} vs {bet.match.awayTeam.name}</p>
                    <p className="text-sm text-muted-foreground">{bet.market} @ {bet.odds.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">+{bet.ev.toFixed(1)}% EV</p>
                    <p className="text-xs text-muted-foreground">Our: {bet.ourProb.toFixed(0)}% vs Book: {bet.impliedProb.toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Button
          variant={showOnlyValue ? "default" : "outline"}
          onClick={() => setShowOnlyValue(!showOnlyValue)}
        >
          {showOnlyValue ? '✓ ' : ''}Show Only Value Bets
        </Button>
        <span className="text-sm text-muted-foreground">
          {displayCalcs.length} matches shown
        </span>
      </div>

      {/* Matches */}
      <div className="space-y-6">
        {displayCalcs.map(({ match, prediction, values }) => (
          <Card key={match.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {match.homeTeam.logo && <Image src={match.homeTeam.logo} alt="" width={24} height={24} />}
                    <span className="font-medium">{match.homeTeam.name}</span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{match.awayTeam.name}</span>
                    {match.awayTeam.logo && <Image src={match.awayTeam.logo} alt="" width={24} height={24} />}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{new Date(match.date).toLocaleDateString()}</p>
                  <p>{match.league}</p>
                </div>
              </div>
              {match.referee && (
                <Link href={`/referees/${match.referee.slug}`} className="text-sm text-primary hover:underline">
                  🧑‍⚖️ {match.referee.name} ({match.referee.avgYellow.toFixed(2)} avg yellow)
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {prediction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Our Prediction */}
                  <div>
                    <h4 className="font-medium mb-3">Our Prediction</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span>Expected Yellow Cards</span>
                        <span className="font-bold text-yellow-500">{prediction.expectedYellow.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span>Over 2.5 Yellow</span>
                        <span className="font-medium">{prediction.over25.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span>Over 3.5 Yellow</span>
                        <span className="font-medium">{prediction.over35.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between p-2 bg-secondary/50 rounded">
                        <span>Over 4.5 Yellow</span>
                        <span className="font-medium">{prediction.over45.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Odds Input */}
                  <div>
                    <h4 className="font-medium mb-3">Enter Bookmaker Odds</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="text-xs text-muted-foreground">Over 2.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.85"
                          value={oddsInputs[match.id]?.over25 || ''}
                          onChange={(e) => updateOdds(match.id, 'over25', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Under 2.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.95"
                          value={oddsInputs[match.id]?.under25 || ''}
                          onChange={(e) => updateOdds(match.id, 'under25', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Over 3.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2.10"
                          value={oddsInputs[match.id]?.over35 || ''}
                          onChange={(e) => updateOdds(match.id, 'over35', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Under 3.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.70"
                          value={oddsInputs[match.id]?.under35 || ''}
                          onChange={(e) => updateOdds(match.id, 'under35', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Over 4.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2.50"
                          value={oddsInputs[match.id]?.over45 || ''}
                          onChange={(e) => updateOdds(match.id, 'over45', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Under 4.5</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.50"
                          value={oddsInputs[match.id]?.under45 || ''}
                          onChange={(e) => updateOdds(match.id, 'under45', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Value Analysis */}
              {values.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Value Analysis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {values.map((v, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          v.isValue && v.ev > 5
                            ? 'bg-green-500/20 border border-green-500/30'
                            : v.isValue
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'bg-secondary/50'
                        }`}
                      >
                        <p className="font-medium">{v.market}</p>
                        <p className="text-xs text-muted-foreground">
                          Our: {v.ourProb.toFixed(0)}% | Book: {v.impliedProb.toFixed(0)}%
                        </p>
                        <p className={`font-bold ${v.ev > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {v.ev > 0 ? '+' : ''}{v.ev.toFixed(1)}% EV
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!match.referee && (
                <p className="text-muted-foreground text-center py-4">
                  No referee assigned yet
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">No Upcoming Matches</h3>
            <p className="text-muted-foreground">
              Check back later when fixtures are scheduled with assigned referees
            </p>
          </CardContent>
        </Card>
      )}

      {/* Methodology */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">How Value is Calculated</h4>
          <p className="text-sm text-muted-foreground">
            <strong>Expected Value (EV)</strong> = (Our Probability × Odds) - 1. A positive EV indicates a value bet
            where the true probability of winning is higher than what the odds suggest. We recommend bets with
            {'>'}5% EV for meaningful edge. Our predictions combine referee history (50%), home team (25%),
            and away team (25%) card averages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
