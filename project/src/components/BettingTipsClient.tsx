'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Referee {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
  avgYellow: number;
  avgRed: number;
  avgPenalties: number;
  matches: number;
  strictness: number;
  homeBias: number;
  leagueName: string;
}

interface Team {
  id: number;
  name: string;
  logo: string | null;
  leagueId: number;
  leagueName: string;
  totalMatches: number;
  avgYellowReceived: number;
  avgRedReceived: number;
  avgFoulsCommitted: number;
}

interface League {
  id: number;
  apiId: number;
  name: string;
}

interface Props {
  referees: Referee[];
  teams: Team[];
  leagues: League[];
}

interface BettingTip {
  id: string;
  type: 'over' | 'under' | 'yes' | 'no';
  market: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  referee: Referee;
  team?: Team;
  expectedValue: number;
}

function generateTips(referees: Referee[], teams: Team[], selectedLeague: number | null): BettingTip[] {
  const tips: BettingTip[] = [];
  const filteredReferees = selectedLeague
    ? referees.filter(r => r.leagueName.toLowerCase().includes(leagues.find(l => l.apiId === selectedLeague)?.name.toLowerCase() || ''))
    : referees;

  // High strictness referees - Over cards tips
  const strictReferees = filteredReferees
    .filter(r => r.strictness >= 6.5 && r.matches >= 10)
    .slice(0, 5);

  for (const ref of strictReferees) {
    const confidence = Math.min(95, 60 + (ref.strictness - 5) * 8 + Math.min(ref.matches, 20));
    tips.push({
      id: `strict-${ref.id}`,
      type: 'over',
      market: 'Total Cards O/U 4.5',
      prediction: `Over 4.5 Cards`,
      confidence,
      reasoning: `${ref.name} averages ${ref.avgYellow.toFixed(1)} yellow cards per match with a strictness index of ${ref.strictness.toFixed(1)}. Based on ${ref.matches} matches this season.`,
      referee: ref,
      expectedValue: (confidence / 100) * 1.9 - 1,
    });
  }

  // Lenient referees - Under cards tips
  const lenientReferees = filteredReferees
    .filter(r => r.strictness <= 4 && r.matches >= 10)
    .slice(0, 5);

  for (const ref of lenientReferees) {
    const confidence = Math.min(90, 55 + (5 - ref.strictness) * 10 + Math.min(ref.matches, 15));
    tips.push({
      id: `lenient-${ref.id}`,
      type: 'under',
      market: 'Total Cards O/U 3.5',
      prediction: `Under 3.5 Cards`,
      confidence,
      reasoning: `${ref.name} is lenient with only ${ref.avgYellow.toFixed(1)} yellows per match. Strictness index: ${ref.strictness.toFixed(1)}.`,
      referee: ref,
      expectedValue: (confidence / 100) * 1.85 - 1,
    });
  }

  // High penalty referees
  const penaltyReferees = filteredReferees
    .filter(r => r.avgPenalties >= 0.3 && r.matches >= 10)
    .slice(0, 3);

  for (const ref of penaltyReferees) {
    const confidence = Math.min(75, 40 + ref.avgPenalties * 80);
    tips.push({
      id: `penalty-${ref.id}`,
      type: 'yes',
      market: 'Penalty in Match',
      prediction: 'Penalty - Yes',
      confidence,
      reasoning: `${ref.name} awards ${ref.avgPenalties.toFixed(2)} penalties per match on average, well above league average.`,
      referee: ref,
      expectedValue: (confidence / 100) * 2.5 - 1,
    });
  }

  // Home bias tips
  const homeBiasReferees = filteredReferees
    .filter(r => Math.abs(r.homeBias) >= 0.3 && r.matches >= 10)
    .slice(0, 3);

  for (const ref of homeBiasReferees) {
    const isHomeFavorite = ref.homeBias > 0;
    const confidence = Math.min(70, 45 + Math.abs(ref.homeBias) * 40);
    tips.push({
      id: `bias-${ref.id}`,
      type: isHomeFavorite ? 'over' : 'under',
      market: 'Away Team Cards',
      prediction: isHomeFavorite ? 'Away Team Over 1.5 Cards' : 'Away Team Under 1.5 Cards',
      confidence,
      reasoning: `${ref.name} shows ${isHomeFavorite ? 'home' : 'away'} team bias (score: ${ref.homeBias.toFixed(2)}). ${isHomeFavorite ? 'Away teams receive more cards.' : 'Away teams receive fewer cards.'}`,
      referee: ref,
      expectedValue: (confidence / 100) * 2.0 - 1,
    });
  }

  return tips.sort((a, b) => b.confidence - a.confidence);
}

const leagues = [
  { apiId: 39, name: 'Premier League' },
  { apiId: 140, name: 'La Liga' },
  { apiId: 135, name: 'Serie A' },
  { apiId: 78, name: 'Bundesliga' },
  { apiId: 61, name: 'Ligue 1' },
  { apiId: 88, name: 'Eredivisie' },
  { apiId: 94, name: 'Liga Portugal' },
  { apiId: 203, name: 'Super Lig' },
];

export default function BettingTipsClient({ referees, teams }: Props) {
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [minConfidence, setMinConfidence] = useState(60);

  const tips = useMemo(
    () => generateTips(referees, teams, selectedLeague).filter(t => t.confidence >= minConfidence),
    [referees, teams, selectedLeague, minConfidence]
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 65) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'over': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'under': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'yes': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground block mb-2">League</label>
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 rounded-lg border border-input bg-background"
                aria-label="Filter by league"
              >
                <option value="">All Leagues</option>
                {leagues.map(league => (
                  <option key={league.apiId} value={league.apiId}>{league.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground block mb-2">
                Min Confidence: {minConfidence}%
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{tips.length}</div>
            <div className="text-sm text-muted-foreground">Active Tips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-500">
              {tips.filter(t => t.type === 'over').length}
            </div>
            <div className="text-sm text-muted-foreground">Over Tips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {tips.filter(t => t.type === 'under').length}
            </div>
            <div className="text-sm text-muted-foreground">Under Tips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {tips.filter(t => t.confidence >= 75).length}
            </div>
            <div className="text-sm text-muted-foreground">High Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Betting Tips ({tips.length})</h2>

        {tips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4 text-muted-foreground font-bold">[!]</div>
              <h3 className="text-xl font-bold mb-2">No Tips Available</h3>
              <p className="text-muted-foreground">
                Try lowering the minimum confidence or selecting a different league
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tips.map((tip) => (
              <Card key={tip.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Left - Referee Info */}
                  <div className="p-4 md:w-64 bg-secondary/30 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden relative shrink-0">
                      {tip.referee.photo ? (
                        <Image
                          src={tip.referee.photo}
                          alt={tip.referee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                          REF
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/referees/${tip.referee.slug}`}
                        className="font-bold hover:text-primary transition-colors"
                      >
                        {tip.referee.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{tip.referee.leagueName}</p>
                      <p className="text-xs text-muted-foreground">{tip.referee.matches} matches</p>
                    </div>
                  </div>

                  {/* Right - Tip Details */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(tip.type)}`}>
                            {tip.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">{tip.market}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tip.prediction}</h3>
                        <p className="text-sm text-muted-foreground">{tip.reasoning}</p>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getConfidenceColor(tip.confidence)}`}>
                          {tip.confidence}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        {tip.expectedValue > 0 && (
                          <div className="mt-2 text-sm text-green-500">
                            +EV: {(tip.expectedValue * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-500">
                          {tip.referee.avgYellow.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Yellow</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">
                          {tip.referee.avgRed.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Red</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {tip.referee.strictness.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Strictness</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-500">
                          {tip.referee.avgPenalties.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Penalties</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> These tips are generated algorithmically based on historical data.
            Past performance does not guarantee future results. Always gamble responsibly and within your means.
            RefTrends does not encourage gambling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
