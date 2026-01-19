'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';

interface ChartData {
  season: string;
  yellowCards: number;
  redCards: number;
  penalties: number;
  matches: number;
  league: string;
}

interface RefereeStatsChartProps {
  data: ChartData[];
}

export default function RefereeStatsChart({ data }: RefereeStatsChartProps) {
  const [activeMetric, setActiveMetric] = useState<'all' | 'yellow' | 'red' | 'penalties'>('all');

  const trends = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0];
    const last = data[data.length - 1];
    return {
      yellowChange: last.yellowCards - first.yellowCards,
      redChange: last.redCards - first.redCards,
      penaltyChange: last.penalties - first.penalties,
      matchesChange: last.matches - first.matches,
    };
  }, [data]);

  const stats = useMemo(() => {
    const totalMatches = data.reduce((sum, d) => sum + d.matches, 0);
    const avgYellow = data.reduce((sum, d) => sum + d.yellowCards, 0) / data.length;
    const avgRed = data.reduce((sum, d) => sum + d.redCards, 0) / data.length;
    const avgPenalty = data.reduce((sum, d) => sum + d.penalties, 0) / data.length;
    return { totalMatches, avgYellow, avgRed, avgPenalty };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const seasonData = data.find(d => d.season === label);
      return (
        <div className="bg-popover border border-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-bold text-lg">{label}</span>
            {seasonData && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {seasonData.league}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Yellow:</span>
              <span className="font-bold text-yellow-500">{seasonData?.yellowCards.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Red:</span>
              <span className="font-bold text-red-500">{seasonData?.redCards.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Penalties:</span>
              <span className="font-bold text-blue-500">{seasonData?.penalties.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Matches:</span>
              <span className="font-bold">{seasonData?.matches}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setActiveMetric(activeMetric === 'yellow' ? 'all' : 'yellow')}
          className={`p-3 rounded-xl text-center transition-all ${
            activeMetric === 'yellow' ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : 'bg-secondary/50 hover:bg-secondary'
          }`}
        >
          <div className="text-xl font-bold text-yellow-500">{stats.avgYellow.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Avg Yellow</div>
          {trends && (
            <div className={`text-xs mt-1 ${trends.yellowChange > 0 ? 'text-red-400' : trends.yellowChange < 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
              {trends.yellowChange > 0 ? '+' : ''}{trends.yellowChange.toFixed(2)}
            </div>
          )}
        </button>
        <button
          onClick={() => setActiveMetric(activeMetric === 'red' ? 'all' : 'red')}
          className={`p-3 rounded-xl text-center transition-all ${
            activeMetric === 'red' ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-secondary/50 hover:bg-secondary'
          }`}
        >
          <div className="text-xl font-bold text-red-500">{stats.avgRed.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Avg Red</div>
          {trends && (
            <div className={`text-xs mt-1 ${trends.redChange > 0 ? 'text-red-400' : trends.redChange < 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
              {trends.redChange > 0 ? '+' : ''}{trends.redChange.toFixed(2)}
            </div>
          )}
        </button>
        <button
          onClick={() => setActiveMetric(activeMetric === 'penalties' ? 'all' : 'penalties')}
          className={`p-3 rounded-xl text-center transition-all ${
            activeMetric === 'penalties' ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-secondary/50 hover:bg-secondary'
          }`}
        >
          <div className="text-xl font-bold text-blue-500">{stats.avgPenalty.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Avg Penalty</div>
          {trends && (
            <div className={`text-xs mt-1 ${trends.penaltyChange > 0 ? 'text-blue-400' : trends.penaltyChange < 0 ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              {trends.penaltyChange > 0 ? '+' : ''}{trends.penaltyChange.toFixed(2)}
            </div>
          )}
        </button>
        <div className="p-3 rounded-xl bg-secondary/50 text-center">
          <div className="text-xl font-bold text-emerald-500">{stats.totalMatches}</div>
          <div className="text-xs text-muted-foreground">Total Matches</div>
          <div className="text-xs text-muted-foreground mt-1">{data.length} seasons</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-secondary/20 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="season"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Matches as background area */}
            <Bar
              yAxisId="right"
              dataKey="matches"
              fill="hsl(var(--primary))"
              opacity={0.15}
              radius={[4, 4, 0, 0]}
            />

            {/* Yellow Cards */}
            {(activeMetric === 'all' || activeMetric === 'yellow') && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="yellowCards"
                  fill="url(#yellowGradient)"
                  stroke="transparent"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="yellowCards"
                  stroke="hsl(var(--yellow-card))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--yellow-card))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--yellow-card))' }}
                />
              </>
            )}

            {/* Red Cards */}
            {(activeMetric === 'all' || activeMetric === 'red') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="redCards"
                stroke="hsl(var(--red-card))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--red-card))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--red-card))' }}
                strokeDasharray={activeMetric === 'all' ? undefined : undefined}
              />
            )}

            {/* Penalties */}
            {(activeMetric === 'all' || activeMetric === 'penalties') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="penalties"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--chart-1))' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-yellow-500 rounded"></div>
          <span className="text-muted-foreground">Yellow Cards</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500 rounded"></div>
          <span className="text-muted-foreground">Red Cards</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-muted-foreground">Penalties</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded"></div>
          <span className="text-muted-foreground">Matches</span>
        </div>
      </div>

      {/* Season Table - Compact */}
      {data.length > 1 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Season</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">League</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Matches</th>
                <th className="text-center py-2 px-2 font-medium text-yellow-500">Yellow</th>
                <th className="text-center py-2 px-2 font-medium text-red-500">Red</th>
                <th className="text-center py-2 px-2 font-medium text-blue-500">Penalties</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={d.season} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-2 px-2 font-medium">{d.season}</td>
                  <td className="py-2 px-2 text-muted-foreground">{d.league}</td>
                  <td className="py-2 px-2 text-center">{d.matches}</td>
                  <td className="py-2 px-2 text-center text-yellow-500 font-medium">{d.yellowCards.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-red-500 font-medium">{d.redCards.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-blue-500 font-medium">{d.penalties.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
