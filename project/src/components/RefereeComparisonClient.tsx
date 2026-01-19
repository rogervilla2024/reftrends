'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface RefereeOption {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
}

interface SeasonStats {
  season: number;
  leagueApiId: number;
  matchesOfficiated: number;
  totalYellowCards: number;
  totalRedCards: number;
  avgYellowCards: number;
  avgRedCards: number;
  totalPenalties: number;
  avgPenalties: number;
  strictnessIndex: number;
  homeBiasScore: number;
}

interface CareerStats {
  totalMatches: number;
  totalYellowCards: number;
  totalRedCards: number;
  totalPenalties: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  avgStrictness: number;
}

interface RefereeFullStats {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  nationality: string | null;
  seasonStats: SeasonStats[];
  careerStats: CareerStats;
}

interface RefereeComparisonClientProps {
  refereeOptions: RefereeOption[];
  refereeStats: Record<number, RefereeFullStats>;
  leagueMap: Record<number, string>;
}

function getStrictnessLabel(index: number): { label: string; color: string } {
  if (index >= 8) return { label: 'Very Strict', color: 'text-red-500' };
  if (index >= 6) return { label: 'Strict', color: 'text-orange-500' };
  if (index >= 4) return { label: 'Average', color: 'text-yellow-500' };
  if (index >= 2) return { label: 'Lenient', color: 'text-green-500' };
  return { label: 'Very Lenient', color: 'text-emerald-500' };
}

export default function RefereeComparisonClient({
  refereeOptions,
  refereeStats,
  // leagueMap reserved for future season breakdown feature
}: RefereeComparisonClientProps) {
  const [selectedReferees, setSelectedReferees] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = refereeOptions.filter((ref) =>
    ref.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addReferee = (id: number) => {
    if (selectedReferees.length < 4 && !selectedReferees.includes(id)) {
      setSelectedReferees([...selectedReferees, id]);
    }
  };

  const removeReferee = (id: number) => {
    setSelectedReferees(selectedReferees.filter((r) => r !== id));
  };

  const selectedRefereesData = selectedReferees
    .map((id) => refereeStats[id])
    .filter(Boolean);

  // Prepare chart data
  const barChartData = selectedRefereesData.map((ref) => ({
    name: ref.name.split(' ').pop() || ref.name,
    yellowCards: ref.careerStats.avgYellowCards,
    redCards: ref.careerStats.avgRedCards,
    penalties: ref.careerStats.avgPenalties,
  }));

  const radarChartData = [
    {
      stat: 'Yellow Cards',
      ...Object.fromEntries(
        selectedRefereesData.map((ref) => [
          ref.name.split(' ').pop(),
          ref.careerStats.avgYellowCards,
        ])
      ),
    },
    {
      stat: 'Red Cards',
      ...Object.fromEntries(
        selectedRefereesData.map((ref) => [
          ref.name.split(' ').pop(),
          ref.careerStats.avgRedCards * 10, // Scale up for visibility
        ])
      ),
    },
    {
      stat: 'Penalties',
      ...Object.fromEntries(
        selectedRefereesData.map((ref) => [
          ref.name.split(' ').pop(),
          ref.careerStats.avgPenalties * 5, // Scale up for visibility
        ])
      ),
    },
    {
      stat: 'Strictness',
      ...Object.fromEntries(
        selectedRefereesData.map((ref) => [
          ref.name.split(' ').pop(),
          ref.careerStats.avgStrictness,
        ])
      ),
    },
    {
      stat: 'Experience',
      ...Object.fromEntries(
        selectedRefereesData.map((ref) => [
          ref.name.split(' ').pop(),
          Math.min(ref.careerStats.totalMatches / 10, 10), // Normalize to 0-10
        ])
      ),
    },
  ];

  const radarColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  // Export to CSV
  const exportToCSV = () => {
    if (selectedRefereesData.length === 0) return;

    const headers = [
      'Referee',
      'Nationality',
      'Total Matches',
      'Total Yellow Cards',
      'Total Red Cards',
      'Total Penalties',
      'Avg Yellow/Match',
      'Avg Red/Match',
      'Avg Penalties/Match',
      'Avg Strictness',
    ];

    const rows = selectedRefereesData.map((ref) => [
      ref.name,
      ref.nationality || 'N/A',
      ref.careerStats.totalMatches,
      ref.careerStats.totalYellowCards,
      ref.careerStats.totalRedCards,
      ref.careerStats.totalPenalties,
      ref.careerStats.avgYellowCards.toFixed(2),
      ref.careerStats.avgRedCards.toFixed(2),
      ref.careerStats.avgPenalties.toFixed(2),
      ref.careerStats.avgStrictness.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `referee-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Referee Selector */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Select Referees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select up to 4 referees to compare
            </p>

            {/* Selected Referees */}
            {selectedReferees.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Selected:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRefereesData.map((ref, index) => (
                    <span
                      key={ref.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: `${radarColors[index]}20`, color: radarColors[index] }}
                    >
                      {ref.name.split(' ').pop()}
                      <button
                        onClick={() => removeReferee(ref.id)}
                        className="ml-1 hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <Input
              placeholder="Search referee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />

            {/* Referee List */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredOptions.slice(0, 50).map((ref) => {
                const isSelected = selectedReferees.includes(ref.id);
                const stats = refereeStats[ref.id];
                return (
                  <button
                    key={ref.id}
                    onClick={() => (isSelected ? removeReferee(ref.id) : addReferee(ref.id))}
                    disabled={selectedReferees.length >= 4 && !isSelected}
                    className={`w-full p-2 rounded text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : selectedReferees.length >= 4
                        ? 'bg-muted opacity-50 cursor-not-allowed'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="font-medium">{ref.name}</div>
                    {stats && (
                      <div className="text-xs opacity-75">
                        {stats.careerStats.totalMatches} matches
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      <div className="lg:col-span-3 space-y-6">
        {selectedRefereesData.length >= 2 ? (
          <>
            {/* Export Button */}
            <div className="flex justify-end">
              <Button onClick={exportToCSV} variant="outline">
                Export to CSV
              </Button>
            </div>

            {/* Stats Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Career Statistics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Statistic</th>
                        {selectedRefereesData.map((ref, index) => (
                          <th
                            key={ref.id}
                            className="text-center py-3 px-2"
                            style={{ color: radarColors[index] }}
                          >
                            <Link href={`/referees/${ref.slug}`} className="hover:underline">
                              {ref.name}
                            </Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Total Matches</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2">
                            {ref.careerStats.totalMatches}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Avg Yellow Cards</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2">
                            <span className="text-yellow-500 font-medium">
                              {ref.careerStats.avgYellowCards.toFixed(2)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Avg Red Cards</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2">
                            <span className="text-red-500 font-medium">
                              {ref.careerStats.avgRedCards.toFixed(2)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Avg Penalties</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2">
                            <span className="text-blue-500 font-medium">
                              {ref.careerStats.avgPenalties.toFixed(2)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2 font-medium">Strictness Index</td>
                        {selectedRefereesData.map((ref) => {
                          const strictness = getStrictnessLabel(ref.careerStats.avgStrictness);
                          return (
                            <td key={ref.id} className="text-center py-3 px-2">
                              <span className={strictness.color}>
                                {ref.careerStats.avgStrictness.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                ({strictness.label})
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">Total Yellow Cards</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2 text-yellow-500">
                            {ref.careerStats.totalYellowCards}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">Total Red Cards</td>
                        {selectedRefereesData.map((ref) => (
                          <td key={ref.id} className="text-center py-3 px-2 text-red-500">
                            {ref.careerStats.totalRedCards}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Average Stats Per Match</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="yellowCards" name="Yellow Cards" fill="hsl(var(--yellow-card))" />
                    <Bar dataKey="redCards" name="Red Cards" fill="hsl(var(--red-card))" />
                    <Bar dataKey="penalties" name="Penalties" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Referee Profile Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} minWidth={0}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="stat" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    {selectedRefereesData.map((ref, index) => (
                      <Radar
                        key={ref.id}
                        name={ref.name}
                        dataKey={ref.name.split(' ').pop()}
                        stroke={radarColors[index]}
                        fill={radarColors[index]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Note: Red Cards and Penalties are scaled for visibility
                </p>
              </CardContent>
            </Card>

            {/* Betting Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Betting Insights
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                    +EV
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Over/Under Recommendations */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Card Market Recommendations</h4>
                    {selectedRefereesData.map((ref, index) => {
                      const totalCards = ref.careerStats.avgYellowCards + ref.careerStats.avgRedCards;
                      const isHighCards = totalCards > 4;
                      const isLowCards = totalCards < 3.5;
                      return (
                        <div
                          key={ref.id}
                          className="p-3 rounded-lg bg-secondary/30"
                          style={{ borderLeft: `3px solid ${radarColors[index]}` }}
                        >
                          <div className="font-medium mb-2">{ref.name}</div>
                          <div className="flex flex-wrap gap-2">
                            {isHighCards && (
                              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                                Over 3.5 Cards
                              </span>
                            )}
                            {isLowCards && (
                              <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                                Under 4.5 Cards
                              </span>
                            )}
                            {!isHighCards && !isLowCards && (
                              <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                                Average - Context Dependent
                              </span>
                            )}
                            {ref.careerStats.avgRedCards > 0.15 && (
                              <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                                Red Card Prone
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Expected: {totalCards.toFixed(1)} cards/match
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Head-to-Head Winners */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Head-to-Head Comparison</h4>
                    <div className="space-y-3">
                      {/* Most Cards */}
                      <div className="p-3 rounded-lg bg-yellow-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Most Cards Per Match</div>
                        <div className="font-bold text-yellow-500">
                          {selectedRefereesData.reduce((max, ref) =>
                            ref.careerStats.avgYellowCards > max.careerStats.avgYellowCards ? ref : max
                          ).name}
                        </div>
                        <div className="text-sm">
                          {Math.max(...selectedRefereesData.map(r => r.careerStats.avgYellowCards)).toFixed(2)} yellow/match
                        </div>
                      </div>

                      {/* Strictest */}
                      <div className="p-3 rounded-lg bg-red-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Strictest Referee</div>
                        <div className="font-bold text-red-500">
                          {selectedRefereesData.reduce((max, ref) =>
                            ref.careerStats.avgStrictness > max.careerStats.avgStrictness ? ref : max
                          ).name}
                        </div>
                        <div className="text-sm">
                          Strictness: {Math.max(...selectedRefereesData.map(r => r.careerStats.avgStrictness)).toFixed(1)}
                        </div>
                      </div>

                      {/* Most Lenient */}
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <div className="text-xs text-muted-foreground mb-1">Most Lenient</div>
                        <div className="font-bold text-green-500">
                          {selectedRefereesData.reduce((min, ref) =>
                            ref.careerStats.avgStrictness < min.careerStats.avgStrictness ? ref : min
                          ).name}
                        </div>
                        <div className="text-sm">
                          Strictness: {Math.min(...selectedRefereesData.map(r => r.careerStats.avgStrictness)).toFixed(1)}
                        </div>
                      </div>

                      {/* Most Experienced */}
                      <div className="p-3 rounded-lg bg-primary/10">
                        <div className="text-xs text-muted-foreground mb-1">Most Experienced</div>
                        <div className="font-bold text-primary">
                          {selectedRefereesData.reduce((max, ref) =>
                            ref.careerStats.totalMatches > max.careerStats.totalMatches ? ref : max
                          ).name}
                        </div>
                        <div className="text-sm">
                          {Math.max(...selectedRefereesData.map(r => r.careerStats.totalMatches))} matches
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 rounded-lg bg-secondary/20 border border-border">
                  <h4 className="font-medium mb-3">Quick Betting Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(() => {
                      const strictest = selectedRefereesData.reduce((max, ref) =>
                        ref.careerStats.avgStrictness > max.careerStats.avgStrictness ? ref : max
                      );
                      const lenient = selectedRefereesData.reduce((min, ref) =>
                        ref.careerStats.avgStrictness < min.careerStats.avgStrictness ? ref : min
                      );
                      const diff = strictest.careerStats.avgYellowCards - lenient.careerStats.avgYellowCards;

                      return (
                        <>
                          <li>
                            <span className="text-yellow-500">•</span> {strictest.name} averages{' '}
                            <span className="text-yellow-500 font-medium">{diff.toFixed(2)} more yellow cards</span>{' '}
                            per match than {lenient.name}
                          </li>
                          <li>
                            <span className="text-green-500">•</span> For <span className="text-green-500 font-medium">Under bets</span>,{' '}
                            prefer matches with {lenient.name}
                          </li>
                          <li>
                            <span className="text-red-500">•</span> For <span className="text-red-500 font-medium">Over bets</span>,{' '}
                            prefer matches with {strictest.name}
                          </li>
                        </>
                      );
                    })()}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4 text-muted-foreground font-bold">[vs]</div>
              <h3 className="text-xl font-bold mb-2">Select Referees to Compare</h3>
              <p className="text-muted-foreground">
                Choose at least 2 referees from the list to see a detailed
                side-by-side comparison with charts and statistics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
