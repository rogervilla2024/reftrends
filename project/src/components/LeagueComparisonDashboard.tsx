'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';

export interface LeagueStats {
  apiId: number;
  name: string;
  country: string;
  logo: string | null;
  matchCount: number;
  refereeCount: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  avgFouls: number;
  strictnessIndex: number;
}

interface Props {
  leagues: LeagueStats[];
}

type SortField = 'avgYellowCards' | 'avgRedCards' | 'avgPenalties' | 'strictnessIndex' | 'matchCount';

const COLORS = ['#eab308', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

export default function LeagueComparisonDashboard({ leagues }: Props) {
  const [sortBy, setSortBy] = useState<SortField>('strictnessIndex');
  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([]);

  // Filter leagues with data
  const leaguesWithData = useMemo(() => {
    return leagues.filter(l => l.matchCount > 0);
  }, [leagues]);

  // Sorted leagues
  const sortedLeagues = useMemo(() => {
    return [...leaguesWithData].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [leaguesWithData, sortBy]);

  // Calculate league rankings
  const rankings = useMemo(() => {
    const yellowRank = [...leaguesWithData].sort((a, b) => b.avgYellowCards - a.avgYellowCards);
    const redRank = [...leaguesWithData].sort((a, b) => b.avgRedCards - a.avgRedCards);
    const strictRank = [...leaguesWithData].sort((a, b) => b.strictnessIndex - a.strictnessIndex);

    return {
      mostYellow: yellowRank[0],
      leastYellow: yellowRank[yellowRank.length - 1],
      mostRed: redRank[0],
      leastRed: redRank[redRank.length - 1],
      strictest: strictRank[0],
      lenient: strictRank[strictRank.length - 1],
    };
  }, [leaguesWithData]);

  // Bar chart data
  const barChartData = useMemo(() => {
    return sortedLeagues.map(league => ({
      name: league.name.length > 15 ? league.name.substring(0, 12) + '...' : league.name,
      fullName: league.name,
      yellow: league.avgYellowCards,
      red: league.avgRedCards,
      penalties: league.avgPenalties,
      strictness: league.strictnessIndex,
    }));
  }, [sortedLeagues]);

  // Radar chart data - normalize values for comparison
  const radarChartData = useMemo(() => {
    const selected = selectedLeagues.length > 0
      ? leaguesWithData.filter(l => selectedLeagues.includes(l.apiId))
      : leaguesWithData.slice(0, 5);

    if (selected.length === 0) return [];

    const maxYellow = Math.max(...leaguesWithData.map(l => l.avgYellowCards));
    const maxRed = Math.max(...leaguesWithData.map(l => l.avgRedCards));
    const maxPenalties = Math.max(...leaguesWithData.map(l => l.avgPenalties)) || 1;
    const maxStrictness = Math.max(...leaguesWithData.map(l => l.strictnessIndex));

    const metrics = ['Yellow Cards', 'Red Cards', 'Penalties', 'Strictness'];

    return metrics.map(metric => {
      const dataPoint: Record<string, string | number> = { metric };
      selected.forEach(league => {
        let value = 0;
        switch (metric) {
          case 'Yellow Cards':
            value = (league.avgYellowCards / maxYellow) * 100;
            break;
          case 'Red Cards':
            value = (league.avgRedCards / maxRed) * 100;
            break;
          case 'Penalties':
            value = (league.avgPenalties / maxPenalties) * 100;
            break;
          case 'Strictness':
            value = (league.strictnessIndex / maxStrictness) * 100;
            break;
        }
        dataPoint[league.name] = Math.round(value);
      });
      return dataPoint;
    });
  }, [leaguesWithData, selectedLeagues]);

  // Toggle league selection for radar chart
  const toggleLeague = (apiId: number) => {
    setSelectedLeagues(prev => {
      if (prev.includes(apiId)) {
        return prev.filter(id => id !== apiId);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), apiId];
      }
      return [...prev, apiId];
    });
  };

  // Get selected league names for radar
  const selectedLeagueNames = useMemo(() => {
    const selected = selectedLeagues.length > 0
      ? leaguesWithData.filter(l => selectedLeagues.includes(l.apiId))
      : leaguesWithData.slice(0, 5);
    return selected.map(l => l.name);
  }, [leaguesWithData, selectedLeagues]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
          <p className="font-bold mb-2">{data.fullName || label}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-yellow-500">Yellow:</span> {data.yellow?.toFixed(2)}</p>
            <p><span className="text-red-500">Red:</span> {data.red?.toFixed(2)}</p>
            <p><span className="text-blue-500">Penalties:</span> {data.penalties?.toFixed(2)}</p>
            <p><span className="text-primary">Strictness:</span> {data.strictness?.toFixed(1)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (leaguesWithData.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No league data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats - Rankings */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="text-xs text-muted-foreground mb-1">Most Yellow Cards</div>
          <div className="font-bold text-yellow-500">{rankings.mostYellow?.name}</div>
          <div className="text-lg font-bold">{rankings.mostYellow?.avgYellowCards.toFixed(2)}/match</div>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="text-xs text-muted-foreground mb-1">Least Yellow Cards</div>
          <div className="font-bold text-green-500">{rankings.leastYellow?.name}</div>
          <div className="text-lg font-bold">{rankings.leastYellow?.avgYellowCards.toFixed(2)}/match</div>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="text-xs text-muted-foreground mb-1">Most Red Cards</div>
          <div className="font-bold text-red-500">{rankings.mostRed?.name}</div>
          <div className="text-lg font-bold">{rankings.mostRed?.avgRedCards.toFixed(2)}/match</div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-xs text-muted-foreground mb-1">Least Red Cards</div>
          <div className="font-bold text-emerald-500">{rankings.leastRed?.name}</div>
          <div className="text-lg font-bold">{rankings.leastRed?.avgRedCards.toFixed(2)}/match</div>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
          <div className="text-xs text-muted-foreground mb-1">Strictest League</div>
          <div className="font-bold text-primary">{rankings.strictest?.name}</div>
          <div className="text-lg font-bold">{rankings.strictest?.strictnessIndex.toFixed(1)} index</div>
        </div>
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <div className="text-xs text-muted-foreground mb-1">Most Lenient</div>
          <div className="font-bold text-cyan-500">{rankings.lenient?.name}</div>
          <div className="text-lg font-bold">{rankings.lenient?.strictnessIndex.toFixed(1)} index</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Cards per Match by League</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-3 py-1 rounded bg-secondary text-sm"
            >
              <option value="strictnessIndex">Sort by Strictness</option>
              <option value="avgYellowCards">Sort by Yellow Cards</option>
              <option value="avgRedCards">Sort by Red Cards</option>
              <option value="avgPenalties">Sort by Penalties</option>
              <option value="matchCount">Sort by Matches</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <BarChart data={barChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="yellow" stackId="cards" fill="hsl(var(--yellow-card))" name="Yellow" />
              <Bar dataKey="red" stackId="cards" fill="hsl(var(--red-card))" name="Red" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Multi-Metric Comparison</h3>
            <div className="flex flex-wrap gap-2">
              {leaguesWithData.map((league, idx) => (
                <button
                  key={league.apiId}
                  onClick={() => toggleLeague(league.apiId)}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    selectedLeagues.includes(league.apiId) || (selectedLeagues.length === 0 && idx < 5)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {league.name.substring(0, 10)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Click to select up to 5 leagues</p>
          </div>
          <ResponsiveContainer width="100%" height={280} minWidth={0}>
            <RadarChart data={radarChartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              {selectedLeagueNames.map((name, idx) => (
                <Radar
                  key={name}
                  name={name}
                  dataKey={name}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="rounded-xl bg-secondary/20 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold">Detailed League Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/30">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">League</th>
                <th className="text-center py-3 px-4">Matches</th>
                <th className="text-center py-3 px-4">Referees</th>
                <th className="text-center py-3 px-4">
                  <span className="text-yellow-500">Avg Yellow</span>
                </th>
                <th className="text-center py-3 px-4">
                  <span className="text-red-500">Avg Red</span>
                </th>
                <th className="text-center py-3 px-4">
                  <span className="text-blue-500">Avg Penalties</span>
                </th>
                <th className="text-center py-3 px-4">Strictness</th>
                <th className="text-center py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeagues.map((league, idx) => {
                // Visual rating bar
                const maxStrictness = Math.max(...leaguesWithData.map(l => l.strictnessIndex));
                const ratingPercent = (league.strictnessIndex / maxStrictness) * 100;

                return (
                  <tr key={league.apiId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {league.logo && (
                          <img src={league.logo} alt={league.name} className="w-6 h-6 object-contain" />
                        )}
                        <span className="font-medium">{league.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{league.matchCount}</td>
                    <td className="py-3 px-4 text-center">{league.refereeCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-yellow-500">{league.avgYellowCards.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-red-500">{league.avgRedCards.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-blue-500">{league.avgPenalties.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-primary">{league.strictnessIndex.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ratingPercent > 75 ? 'bg-red-500' :
                              ratingPercent > 50 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${ratingPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Betting Insights */}
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
        <h3 className="font-bold mb-3">Betting Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Best for Over Cards:</span>
            <p className="font-medium">
              {rankings.mostYellow?.name} - High yellow card average ({rankings.mostYellow?.avgYellowCards.toFixed(2)}/match)
              suggests better odds for over card markets.
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Best for Under Cards:</span>
            <p className="font-medium">
              {rankings.leastYellow?.name} - Lower card rates ({rankings.leastYellow?.avgYellowCards.toFixed(2)}/match)
              favor under card betting.
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Red Card Alert:</span>
            <p className="font-medium">
              {rankings.mostRed?.name} has the highest red card rate ({rankings.mostRed?.avgRedCards.toFixed(2)}/match).
              Consider red card markets here.
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Fair Play League:</span>
            <p className="font-medium">
              {rankings.lenient?.name} shows the most lenient officiating (strictness: {rankings.lenient?.strictnessIndex.toFixed(1)}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
