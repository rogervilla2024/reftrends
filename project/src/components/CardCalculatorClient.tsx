'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Referee {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  avgYellow: number;
  avgRed: number;
  matches: number;
  strictness: number;
}

interface Team {
  id: number;
  name: string;
  logo: string | null;
  league: string;
  avgHomeYellow: number;
  avgHomeRed: number;
  avgAwayYellow: number;
  avgAwayRed: number;
}


interface Props {
  referees: Referee[];
  teams: Team[];
}

// Poisson probability calculation
function poissonProbability(lambda: number, k: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function calculateOverUnderProb(expectedCards: number, line: number): { over: number; under: number } {
  let underProb = 0;
  for (let i = 0; i < line; i++) {
    underProb += poissonProbability(expectedCards, i);
  }
  return {
    under: underProb * 100,
    over: (1 - underProb) * 100,
  };
}

export default function CardCalculatorClient({ referees, teams }: Props) {
  const [selectedReferee, setSelectedReferee] = useState<Referee | null>(null);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<Team | null>(null);
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<Team | null>(null);
  const [refereeSearch, setRefereeSearch] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  const [awaySearch, setAwaySearch] = useState('');

  const filteredReferees = useMemo(() =>
    referees.filter(r => r.name.toLowerCase().includes(refereeSearch.toLowerCase())).slice(0, 10),
    [referees, refereeSearch]
  );

  const filteredHomeTeams = useMemo(() =>
    teams.filter(t => t.name.toLowerCase().includes(homeSearch.toLowerCase()) && t.id !== selectedAwayTeam?.id).slice(0, 10),
    [teams, homeSearch, selectedAwayTeam]
  );

  const filteredAwayTeams = useMemo(() =>
    teams.filter(t => t.name.toLowerCase().includes(awaySearch.toLowerCase()) && t.id !== selectedHomeTeam?.id).slice(0, 10),
    [teams, awaySearch, selectedHomeTeam]
  );

  // Calculate predictions
  const predictions = useMemo(() => {
    if (!selectedReferee || !selectedHomeTeam || !selectedAwayTeam) return null;

    // Get league average for context

    // Weighted calculation:
    // 40% referee average
    // 30% home team average (at home)
    // 30% away team average (away)
    const expectedHomeYellow = (
      selectedReferee.avgYellow * 0.4 * 0.5 +
      selectedHomeTeam.avgHomeYellow * 0.6
    );
    const expectedAwayYellow = (
      selectedReferee.avgYellow * 0.4 * 0.5 +
      selectedAwayTeam.avgAwayYellow * 0.6
    );
    const expectedTotalYellow = expectedHomeYellow + expectedAwayYellow;

    const expectedHomeRed = (
      selectedReferee.avgRed * 0.4 * 0.5 +
      selectedHomeTeam.avgHomeRed * 0.6
    );
    const expectedAwayRed = (
      selectedReferee.avgRed * 0.4 * 0.5 +
      selectedAwayTeam.avgAwayRed * 0.6
    );
    const expectedTotalRed = expectedHomeRed + expectedAwayRed;

    const expectedTotalCards = expectedTotalYellow + expectedTotalRed;

    // Calculate over/under probabilities for common lines
    const yellowLines = [2.5, 3.5, 4.5, 5.5, 6.5];
    const totalLines = [3.5, 4.5, 5.5, 6.5];

    return {
      home: {
        yellow: expectedHomeYellow,
        red: expectedHomeRed,
        total: expectedHomeYellow + expectedHomeRed,
      },
      away: {
        yellow: expectedAwayYellow,
        red: expectedAwayRed,
        total: expectedAwayYellow + expectedAwayRed,
      },
      total: {
        yellow: expectedTotalYellow,
        red: expectedTotalRed,
        cards: expectedTotalCards,
      },
      yellowOverUnder: yellowLines.map(line => ({
        line,
        ...calculateOverUnderProb(expectedTotalYellow, line),
      })),
      totalOverUnder: totalLines.map(line => ({
        line,
        ...calculateOverUnderProb(expectedTotalCards, line),
      })),
      confidence: Math.min(selectedReferee.matches, 20) * 5, // 0-100% based on sample size
    };
  }, [selectedReferee, selectedHomeTeam, selectedAwayTeam]);

  return (
    <div className="space-y-6">
      {/* Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Referee */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Referee</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search referee..."
              value={refereeSearch}
              onChange={(e) => setRefereeSearch(e.target.value)}
              className="mb-3"
            />
            {selectedReferee ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden relative">
                    {selectedReferee.photo ? (
                      <Image src={selectedReferee.photo} alt={selectedReferee.name} fill className="object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">REF</div>}
                  </div>
                  <div>
                    <p className="font-medium">{selectedReferee.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedReferee.avgYellow.toFixed(1)} yellow/match</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedReferee(null)}>X</Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredReferees.map(ref => (
                  <button
                    key={ref.id}
                    onClick={() => { setSelectedReferee(ref); setRefereeSearch(''); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative">
                      {ref.photo ? <Image src={ref.photo} alt={ref.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">REF</div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ref.name}</p>
                      <p className="text-xs text-muted-foreground">{ref.avgYellow.toFixed(1)} Y/m | {ref.matches} matches</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Home Team */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Home Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search home team..."
              value={homeSearch}
              onChange={(e) => setHomeSearch(e.target.value)}
              className="mb-3"
            />
            {selectedHomeTeam ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedHomeTeam.logo && <Image src={selectedHomeTeam.logo} alt={selectedHomeTeam.name} width={32} height={32} />}
                  <div>
                    <p className="font-medium">{selectedHomeTeam.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedHomeTeam.avgHomeYellow.toFixed(1)} yellow/home match</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedHomeTeam(null)}>X</Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredHomeTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setSelectedHomeTeam(team); setHomeSearch(''); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-left"
                  >
                    {team.logo && <Image src={team.logo} alt={team.name} width={24} height={24} />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.league}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Away Team */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Away Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search away team..."
              value={awaySearch}
              onChange={(e) => setAwaySearch(e.target.value)}
              className="mb-3"
            />
            {selectedAwayTeam ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedAwayTeam.logo && <Image src={selectedAwayTeam.logo} alt={selectedAwayTeam.name} width={32} height={32} />}
                  <div>
                    <p className="font-medium">{selectedAwayTeam.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedAwayTeam.avgAwayYellow.toFixed(1)} yellow/away match</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedAwayTeam(null)}>X</Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredAwayTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setSelectedAwayTeam(team); setAwaySearch(''); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-left"
                  >
                    {team.logo && <Image src={team.logo} alt={team.name} width={24} height={24} />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.league}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {predictions && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Match Prediction</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Confidence: {predictions.confidence}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{selectedHomeTeam?.name}</p>
                  <p className="text-2xl font-bold text-yellow-500">{predictions.home.yellow.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Expected Yellow</p>
                </div>
                <div className="p-4 bg-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-3xl font-bold">{predictions.total.yellow.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Expected Yellow Cards</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{selectedAwayTeam?.name}</p>
                  <p className="text-2xl font-bold text-yellow-500">{predictions.away.yellow.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Expected Yellow</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xl font-bold text-red-500">{predictions.total.red.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Expected Red Cards</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold">{predictions.total.cards.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Total Cards (Y+R)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Over/Under Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yellow Cards Over/Under</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.yellowOverUnder.map(({ line, over, under }) => (
                    <div key={line} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <span className="font-medium">{line} Cards</span>
                      <div className="flex gap-4 text-sm">
                        <span className={under > 50 ? 'text-green-500 font-bold' : ''}>
                          Under: {under.toFixed(0)}%
                        </span>
                        <span className={over > 50 ? 'text-green-500 font-bold' : ''}>
                          Over: {over.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Cards Over/Under</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.totalOverUnder.map(({ line, over, under }) => (
                    <div key={line} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <span className="font-medium">{line} Cards</span>
                      <div className="flex gap-4 text-sm">
                        <span className={under > 50 ? 'text-green-500 font-bold' : ''}>
                          Under: {under.toFixed(0)}%
                        </span>
                        <span className={over > 50 ? 'text-green-500 font-bold' : ''}>
                          Over: {over.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Methodology */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Method:</strong> Predictions use a weighted average of referee tendencies (40%)
                and team discipline records (60%). Over/Under probabilities are calculated using Poisson distribution.
                Based on {selectedReferee?.matches || 0} matches for {selectedReferee?.name}.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!predictions && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4 text-muted-foreground font-bold">[C]</div>
            <h3 className="text-xl font-bold mb-2">Select Match Details</h3>
            <p className="text-muted-foreground">
              Choose a referee and both teams above to calculate expected cards
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
