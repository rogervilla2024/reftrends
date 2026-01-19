'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RefereeTeamCombo {
  refereeId: number;
  refereeName: string;
  refereeSlug: string;
  refereePhoto: string | null;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  leagueName: string;
  matchCount: number;
  totalYellowCards: number;
  totalRedCards: number;
  avgYellowCards: number;
  avgRedCards: number;
  over25Rate: number;
  over35Rate: number;
  over45Rate: number;
}

interface Props {
  combos: RefereeTeamCombo[];
}

type SortField = 'over25Rate' | 'over35Rate' | 'over45Rate' | 'avgYellowCards' | 'matchCount';
type MarketFilter = 'all' | 'over25' | 'over35' | 'over45';

const leagues = [
  'All Leagues',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Eredivisie',
  'Liga Portugal',
  'Super Lig',
];

export default function SureCardsClient({ combos }: Props) {
  const [sortField, setSortField] = useState<SortField>('over35Rate');
  const [sortDesc, setSortDesc] = useState(true);
  const [leagueFilter, setLeagueFilter] = useState('All Leagues');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all');
  const [minMatches, setMinMatches] = useState(3);
  const [minRate, setMinRate] = useState(70);

  const filteredCombos = useMemo(() => {
    return combos
      .filter(c => {
        if (leagueFilter !== 'All Leagues' && c.leagueName !== leagueFilter) return false;
        if (c.matchCount < minMatches) return false;

        // Apply market filter
        if (marketFilter === 'over25' && c.over25Rate < minRate) return false;
        if (marketFilter === 'over35' && c.over35Rate < minRate) return false;
        if (marketFilter === 'over45' && c.over45Rate < minRate) return false;

        return true;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        return sortDesc ? bVal - aVal : aVal - bVal;
      })
      .slice(0, 50);
  }, [combos, sortField, sortDesc, leagueFilter, marketFilter, minMatches, minRate]);

  const topCombos = useMemo(() => {
    return combos
      .filter(c => c.matchCount >= 5)
      .sort((a, b) => b.over35Rate - a.over35Rate)
      .slice(0, 3);
  }, [combos]);

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    if (rate >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (rate: number, matches: number) => {
    if (rate >= 80 && matches >= 5) return { label: 'HIGH', color: 'bg-green-500/20 text-green-400' };
    if (rate >= 65 && matches >= 4) return { label: 'MEDIUM', color: 'bg-yellow-500/20 text-yellow-400' };
    return { label: 'LOW', color: 'bg-gray-500/20 text-gray-400' };
  };

  return (
    <div className="space-y-6">
      {/* Top Picks */}
      {topCombos.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Top Picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCombos.map((combo, idx) => (
              <Card key={`${combo.refereeId}-${combo.teamId}`} className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-primary">#{idx + 1}</span>
                    <span className={`text-2xl font-bold ${getRateColor(combo.over35Rate)}`}>
                      {combo.over35Rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden relative">
                      {combo.refereePhoto ? (
                        <Image src={combo.refereePhoto} alt={combo.refereeName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">REF</div>
                      )}
                    </div>
                    <div>
                      <Link href={`/referees/${combo.refereeSlug}`} className="font-bold hover:text-primary">
                        {combo.refereeName}
                      </Link>
                      <p className="text-xs text-muted-foreground">+ {combo.teamName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">O/U 3.5 Cards</span>
                    <span className="font-bold">{combo.matchCount} matches</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">League</label>
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="w-full p-2 rounded-lg border border-input bg-background"
                aria-label="Filter by league"
              >
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Market</label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value as MarketFilter)}
                className="w-full p-2 rounded-lg border border-input bg-background"
                aria-label="Filter by market type"
              >
                <option value="all">All Markets</option>
                <option value="over25">Over 2.5 Cards</option>
                <option value="over35">Over 3.5 Cards</option>
                <option value="over45">Over 4.5 Cards</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Min Matches: {minMatches}
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={minMatches}
                onChange={(e) => setMinMatches(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Min Rate: {minRate}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={minRate}
                onChange={(e) => setMinRate(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground py-2">Sort by:</span>
        {[
          { field: 'over35Rate' as SortField, label: 'O/U 3.5 Rate' },
          { field: 'over25Rate' as SortField, label: 'O/U 2.5 Rate' },
          { field: 'over45Rate' as SortField, label: 'O/U 4.5 Rate' },
          { field: 'avgYellowCards' as SortField, label: 'Avg Yellow' },
          { field: 'matchCount' as SortField, label: 'Matches' },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => {
              if (sortField === field) {
                setSortDesc(!sortDesc);
              } else {
                setSortField(field);
                setSortDesc(true);
              }
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              sortField === field
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {label} {sortField === field && (sortDesc ? 'v' : '^')}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredCombos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 text-muted-foreground font-bold">?</div>
              <h3 className="text-xl font-bold mb-2">No Combinations Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" aria-label="Referee and team card statistics">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="text-left py-3 px-2">Referee</th>
                    <th scope="col" className="text-left py-3 px-2">Team</th>
                    <th scope="col" className="text-center py-3 px-2">Matches</th>
                    <th scope="col" className="text-center py-3 px-2">Avg Yellow</th>
                    <th scope="col" className="text-center py-3 px-2">O/U 2.5</th>
                    <th scope="col" className="text-center py-3 px-2">O/U 3.5</th>
                    <th scope="col" className="text-center py-3 px-2">O/U 4.5</th>
                    <th scope="col" className="text-center py-3 px-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCombos.map((combo) => {
                    const badge = getConfidenceBadge(combo.over35Rate, combo.matchCount);
                    return (
                      <tr
                        key={`${combo.refereeId}-${combo.teamId}`}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative shrink-0">
                              {combo.refereePhoto ? (
                                <Image src={combo.refereePhoto} alt={combo.refereeName} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">REF</div>
                              )}
                            </div>
                            <Link
                              href={`/referees/${combo.refereeSlug}`}
                              className="font-medium hover:text-primary text-sm"
                            >
                              {combo.refereeName}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {combo.teamLogo && (
                              <Image src={combo.teamLogo} alt={combo.teamName} width={20} height={20} />
                            )}
                            <span className="text-sm">{combo.teamName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-medium">{combo.matchCount}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-yellow-500 font-bold">
                            {combo.avgYellowCards.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold ${getRateColor(combo.over25Rate)}`}>
                            {combo.over25Rate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold ${getRateColor(combo.over35Rate)}`}>
                            {combo.over35Rate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`font-bold ${getRateColor(combo.over45Rate)}`}>
                            {combo.over45Rate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">How to Use</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- O/U rates show historical percentage of matches exceeding that card line</li>
            <li>- Higher match count = more reliable data</li>
            <li>- Look for combinations with high rates AND sufficient sample size</li>
            <li>- Confidence badge considers both rate and match count</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
