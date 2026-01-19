'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Fixture {
  id: number;
  date: string;
  homeTeam: { id: number; name: string; logo: string | null };
  awayTeam: { id: number; name: string; logo: string | null };
  league: { id: number; name: string; apiId: number };
  referee: {
    id: number;
    name: string;
    slug: string;
    photo: string | null;
  } | null;
}

interface RefereeStats {
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  strictnessIndex: number;
  matchesOfficiated: number;
}

interface TeamStats {
  teamId: number;
  avgYellowReceived: number;
  avgRedReceived: number;
  matchesPlayed: number;
}

interface HeadToHead {
  refereeId: number;
  teamId: number;
  matches: number;
  yellowCards: number;
  redCards: number;
  wins: number;
  draws: number;
  losses: number;
}

interface MatchAnalyzerClientProps {
  fixtures: Fixture[];
  refereeStats: Record<number, RefereeStats>;
  teamStats: Record<number, TeamStats>;
  h2hStats: Record<string, HeadToHead>;
}

function getStrictnessLabel(index: number): { label: string; color: string } {
  if (index >= 8) return { label: 'Very Strict', color: 'text-red-500' };
  if (index >= 6) return { label: 'Strict', color: 'text-orange-500' };
  if (index >= 4) return { label: 'Average', color: 'text-yellow-500' };
  if (index >= 2) return { label: 'Lenient', color: 'text-green-500' };
  return { label: 'Very Lenient', color: 'text-emerald-500' };
}

function calculatePredictions(
  fixture: Fixture,
  refereeStats: Record<number, RefereeStats>,
  teamStats: Record<number, TeamStats>,
  h2hStats: Record<string, HeadToHead>
) {
  const refStats = fixture.referee ? refereeStats[fixture.referee.id] : null;
  const homeTeamStats = teamStats[fixture.homeTeam.id];
  const awayTeamStats = teamStats[fixture.awayTeam.id];

  // Default values if no data
  const defaultYellow = 3.5;
  const defaultRed = 0.15;

  // Referee average
  const refYellow = refStats?.avgYellowCards ?? defaultYellow;
  const refRed = refStats?.avgRedCards ?? defaultRed;

  // Team averages
  const homeYellow = homeTeamStats?.avgYellowReceived ?? 1.5;
  const awayYellow = awayTeamStats?.avgYellowReceived ?? 1.5;
  const homeRed = homeTeamStats?.avgRedReceived ?? 0.07;
  const awayRed = awayTeamStats?.avgRedReceived ?? 0.07;

  // Combined prediction (weighted average: 50% referee, 25% each team)
  const expectedYellow = refYellow * 0.5 + (homeYellow + awayYellow) * 0.5;
  const expectedRed = refRed * 0.5 + (homeRed + awayRed) * 0.5;

  // Calculate probabilities for over/under lines
  const overUnderLines = [2.5, 3.5, 4.5, 5.5, 6.5];
  const yellowProbabilities = overUnderLines.map((line) => {
    // Simple model using Poisson-like distribution approximation
    const prob = 1 - Math.exp(-expectedYellow) *
      Array.from({ length: Math.floor(line) + 1 }, (_, k) =>
        Math.pow(expectedYellow, k) / factorial(k)
      ).reduce((a, b) => a + b, 0);
    return { line, probability: Math.max(0, Math.min(1, prob)) };
  });

  // Calculate confidence based on data availability
  let confidence = 0;
  if (refStats && refStats.matchesOfficiated >= 10) confidence += 40;
  else if (refStats) confidence += 20;
  if (homeTeamStats && homeTeamStats.matchesPlayed >= 5) confidence += 15;
  if (awayTeamStats && awayTeamStats.matchesPlayed >= 5) confidence += 15;

  // H2H data
  const homeH2H = fixture.referee
    ? h2hStats[`${fixture.referee.id}-${fixture.homeTeam.id}`]
    : null;
  const awayH2H = fixture.referee
    ? h2hStats[`${fixture.referee.id}-${fixture.awayTeam.id}`]
    : null;

  if (homeH2H && homeH2H.matches >= 2) confidence += 15;
  if (awayH2H && awayH2H.matches >= 2) confidence += 15;

  return {
    expectedYellow: Math.round(expectedYellow * 10) / 10,
    expectedRed: Math.round(expectedRed * 100) / 100,
    yellowProbabilities,
    confidence: Math.min(100, confidence),
    homeH2H,
    awayH2H,
    refStats,
  };
}

// Memoized factorial calculation to prevent stack overflow and improve performance
const factorialCache: Record<number, number> = { 0: 1, 1: 1 };
function factorial(n: number): number {
  if (n < 0) return 1;
  if (n > 170) return Infinity; // Prevent overflow
  if (factorialCache[n] !== undefined) return factorialCache[n];
  factorialCache[n] = n * factorial(n - 1);
  return factorialCache[n];
}

export default function MatchAnalyzerClient({
  fixtures,
  refereeStats,
  teamStats,
  h2hStats,
}: MatchAnalyzerClientProps) {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);

  const leagues = Array.from(
    new Map(fixtures.map((f) => [f.league.apiId, f.league])).values()
  );

  const filteredFixtures = selectedLeague
    ? fixtures.filter((f) => f.league.apiId === selectedLeague)
    : fixtures;

  const predictions = selectedFixture
    ? calculatePredictions(selectedFixture, refereeStats, teamStats, h2hStats)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fixture Selector */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Select Fixture</CardTitle>
          </CardHeader>
          <CardContent>
            {/* League Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                size="sm"
                variant={selectedLeague === null ? 'default' : 'outline'}
                onClick={() => setSelectedLeague(null)}
              >
                All
              </Button>
              {leagues.map((league) => (
                <Button
                  key={league.apiId}
                  size="sm"
                  variant={selectedLeague === league.apiId ? 'default' : 'outline'}
                  onClick={() => setSelectedLeague(league.apiId)}
                >
                  {league.name}
                </Button>
              ))}
            </div>

            {/* Fixture List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredFixtures.map((fixture) => (
                <button
                  key={fixture.id}
                  onClick={() => setSelectedFixture(fixture)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedFixture?.id === fixture.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(fixture.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {fixture.homeTeam.name}
                    </span>
                    <span className="text-xs">vs</span>
                    <span className="font-medium text-sm">
                      {fixture.awayTeam.name}
                    </span>
                  </div>
                  {fixture.referee && (
                    <div className="text-xs mt-1 opacity-75">
                      Ref: {fixture.referee.name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      <div className="lg:col-span-2 space-y-6">
        {selectedFixture ? (
          <>
            {/* Match Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {selectedFixture.homeTeam.logo && (
                      <Image
                        src={selectedFixture.homeTeam.logo}
                        alt={selectedFixture.homeTeam.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    )}
                    <div>
                      <div className="font-bold text-lg">
                        {selectedFixture.homeTeam.name}
                      </div>
                      <div className="text-sm text-muted-foreground">Home</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">VS</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(selectedFixture.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {selectedFixture.awayTeam.name}
                      </div>
                      <div className="text-sm text-muted-foreground">Away</div>
                    </div>
                    {selectedFixture.awayTeam.logo && (
                      <Image
                        src={selectedFixture.awayTeam.logo}
                        alt={selectedFixture.awayTeam.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referee Impact Analysis */}
            {selectedFixture.referee && predictions?.refStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Referee Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {selectedFixture.referee.photo ? (
                        <Image
                          src={selectedFixture.referee.photo}
                          alt={selectedFixture.referee.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          {selectedFixture.referee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/referees/${selectedFixture.referee.slug}`}
                        className="font-bold text-lg hover:text-primary transition-colors"
                      >
                        {selectedFixture.referee.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {predictions.refStats.matchesOfficiated} matches this season
                      </div>
                      <div className={`text-sm font-medium ${
                        getStrictnessLabel(predictions.refStats.strictnessIndex).color
                      }`}>
                        {getStrictnessLabel(predictions.refStats.strictnessIndex).label}
                        {' '}(Index: {predictions.refStats.strictnessIndex.toFixed(1)})
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">
                        {predictions.refStats.avgYellowCards.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Yellow/Match
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {predictions.refStats.avgRedCards.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Red/Match
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">
                        {predictions.refStats.avgPenalties.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Penalties/Match
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card Predictions */}
            {predictions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Card Market Predictions</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Confidence: {predictions.confidence}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-4xl font-bold text-yellow-500">
                        {predictions.expectedYellow}
                      </div>
                      <div className="text-sm font-medium mt-2">
                        Expected Yellow Cards
                      </div>
                    </div>
                    <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-4xl font-bold text-red-500">
                        {predictions.expectedRed}
                      </div>
                      <div className="text-sm font-medium mt-2">
                        Expected Red Cards
                      </div>
                    </div>
                  </div>

                  {/* Over/Under Probabilities */}
                  <h4 className="font-medium mb-3">Yellow Cards Over/Under</h4>
                  <div className="space-y-2">
                    {predictions.yellowProbabilities.map(({ line, probability }) => (
                      <div key={line} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          O/U {line}
                        </div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm">
                          <span className="text-green-500">
                            {(probability * 100).toFixed(0)}%
                          </span>
                          {' / '}
                          <span className="text-red-500">
                            {((1 - probability) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Head-to-Head with Referee */}
            {(predictions?.homeH2H || predictions?.awayH2H) && (
              <Card>
                <CardHeader>
                  <CardTitle>Team vs Referee History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Home Team H2H */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-bold mb-3">
                        {selectedFixture.homeTeam.name}
                      </h4>
                      {predictions.homeH2H ? (
                        <>
                          <div className="text-sm text-muted-foreground mb-2">
                            {predictions.homeH2H.matches} matches with this referee
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-lg font-bold text-green-500">
                                {predictions.homeH2H.wins}
                              </div>
                              <div className="text-xs">Wins</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">
                                {predictions.homeH2H.draws}
                              </div>
                              <div className="text-xs">Draws</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-500">
                                {predictions.homeH2H.losses}
                              </div>
                              <div className="text-xs">Losses</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-sm">
                              <span>Yellow cards received:</span>
                              <span className="text-yellow-500 font-medium">
                                {predictions.homeH2H.yellowCards} ({(
                                  predictions.homeH2H.yellowCards /
                                  predictions.homeH2H.matches
                                ).toFixed(2)}/match)
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span>Red cards received:</span>
                              <span className="text-red-500 font-medium">
                                {predictions.homeH2H.redCards}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No history with this referee
                        </p>
                      )}
                    </div>

                    {/* Away Team H2H */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-bold mb-3">
                        {selectedFixture.awayTeam.name}
                      </h4>
                      {predictions.awayH2H ? (
                        <>
                          <div className="text-sm text-muted-foreground mb-2">
                            {predictions.awayH2H.matches} matches with this referee
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-lg font-bold text-green-500">
                                {predictions.awayH2H.wins}
                              </div>
                              <div className="text-xs">Wins</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">
                                {predictions.awayH2H.draws}
                              </div>
                              <div className="text-xs">Draws</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-red-500">
                                {predictions.awayH2H.losses}
                              </div>
                              <div className="text-xs">Losses</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-sm">
                              <span>Yellow cards received:</span>
                              <span className="text-yellow-500 font-medium">
                                {predictions.awayH2H.yellowCards} ({(
                                  predictions.awayH2H.yellowCards /
                                  predictions.awayH2H.matches
                                ).toFixed(2)}/match)
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                              <span>Red cards received:</span>
                              <span className="text-red-500 font-medium">
                                {predictions.awayH2H.redCards}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No history with this referee
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4 text-muted-foreground font-bold">&lt;-</div>
              <h3 className="text-xl font-bold mb-2">Select a Fixture</h3>
              <p className="text-muted-foreground">
                Choose a match from the list to see detailed referee analysis,
                card predictions, and team head-to-head statistics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
