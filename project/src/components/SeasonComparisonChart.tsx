'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';

interface SeasonData {
  season: string;
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  strictnessIndex: number;
  leagueName: string;
}

interface Props {
  seasonStats: SeasonData[];
  refereeName: string;
}

type ChartType = 'line' | 'bar' | 'composed';
type MetricType = 'cards' | 'strictness' | 'all';

export default function SeasonComparisonChart({ seasonStats, refereeName }: Props) {
  const [chartType, setChartType] = useState<ChartType>('composed');
  const [metricType, setMetricType] = useState<MetricType>('all');

  const sortedData = useMemo(() => {
    return [...seasonStats].sort((a, b) => {
      const yearA = parseInt(a.season.split('/')[0]);
      const yearB = parseInt(b.season.split('/')[0]);
      return yearA - yearB;
    });
  }, [seasonStats]);

  const trends = useMemo(() => {
    if (sortedData.length < 2) return null;

    const first = sortedData[0];
    const last = sortedData[sortedData.length - 1];

    const yellowChange = last.avgYellowCards - first.avgYellowCards;
    const strictnessChange = last.strictnessIndex - first.strictnessIndex;
    const matchesChange = last.matchesOfficiated - first.matchesOfficiated;

    // Calculate average across all seasons
    const avgYellow = sortedData.reduce((sum, s) => sum + s.avgYellowCards, 0) / sortedData.length;
    const avgStrictness = sortedData.reduce((sum, s) => sum + s.strictnessIndex, 0) / sortedData.length;

    return {
      yellowChange,
      strictnessChange,
      matchesChange,
      avgYellow,
      avgStrictness,
      yellowTrend: yellowChange > 0.3 ? 'increasing' : yellowChange < -0.3 ? 'decreasing' : 'stable',
      strictnessTrend: strictnessChange > 0.5 ? 'stricter' : strictnessChange < -0.5 ? 'lenient' : 'stable',
    };
  }, [sortedData]);

  if (sortedData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No season data available for comparison
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: sortedData,
      margin: { top: 20, right: 30, left: 0, bottom: 5 },
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="season" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {(metricType === 'cards' || metricType === 'all') && (
            <>
              <Line
                type="monotone"
                dataKey="avgYellowCards"
                name="Avg Yellow"
                stroke="hsl(var(--yellow-card))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--yellow-card))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="avgRedCards"
                name="Avg Red"
                stroke="hsl(var(--red-card))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--red-card))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </>
          )}
          {(metricType === 'strictness' || metricType === 'all') && (
            <Line
              type="monotone"
              dataKey="strictnessIndex"
              name="Strictness"
              stroke="hsl(var(--chart-5))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-5))', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="season" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {(metricType === 'cards' || metricType === 'all') && (
            <>
              <Bar dataKey="avgYellowCards" name="Avg Yellow" fill="hsl(var(--yellow-card))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgRedCards" name="Avg Red" fill="hsl(var(--red-card))" radius={[4, 4, 0, 0]} />
            </>
          )}
          {(metricType === 'strictness' || metricType === 'all') && (
            <Bar dataKey="strictnessIndex" name="Strictness" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      );
    }

    // Composed chart (default)
    return (
      <ComposedChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="season" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 10]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="matchesOfficiated"
          name="Matches"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.2}
          stroke="hsl(var(--chart-1))"
          strokeWidth={1}
        />
        <Bar yAxisId="left" dataKey="avgYellowCards" name="Avg Yellow" fill="hsl(var(--yellow-card))" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="strictnessIndex"
          name="Strictness"
          stroke="hsl(var(--chart-5))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--chart-5))', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground py-2">Chart:</span>
          {(['composed', 'line', 'bar'] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                chartType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {chartType !== 'composed' && (
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground py-2">Metric:</span>
            {(['all', 'cards', 'strictness'] as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setMetricType(metric)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  metricType === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Trend Summary */}
      {trends && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-yellow-500/10 text-center">
            <div className="text-sm text-muted-foreground mb-1">Yellow Card Trend</div>
            <div className={`text-xl font-bold ${
              trends.yellowTrend === 'increasing' ? 'text-red-500' :
              trends.yellowTrend === 'decreasing' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {trends.yellowChange > 0 ? '+' : ''}{trends.yellowChange.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {trends.yellowTrend === 'increasing' ? 'More strict' :
               trends.yellowTrend === 'decreasing' ? 'More lenient' : 'Stable'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 text-center">
            <div className="text-sm text-muted-foreground mb-1">Strictness Trend</div>
            <div className={`text-xl font-bold ${
              trends.strictnessTrend === 'stricter' ? 'text-red-500' :
              trends.strictnessTrend === 'lenient' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {trends.strictnessChange > 0 ? '+' : ''}{trends.strictnessChange.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {trends.strictnessTrend === 'stricter' ? 'Getting stricter' :
               trends.strictnessTrend === 'lenient' ? 'Getting lenient' : 'Consistent'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 text-center">
            <div className="text-sm text-muted-foreground mb-1">Career Avg Yellow</div>
            <div className="text-xl font-bold text-yellow-500">
              {trends.avgYellow.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              per match
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-sm text-muted-foreground mb-1">Career Avg Strictness</div>
            <div className="text-xl font-bold text-purple-500">
              {trends.avgStrictness.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              out of 10
            </div>
          </div>
        </div>
      )}

      {/* Season Details Table */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Season by Season</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Season</th>
                <th className="text-left py-2 px-3">League</th>
                <th className="text-center py-2 px-3">Matches</th>
                <th className="text-center py-2 px-3">Avg Yellow</th>
                <th className="text-center py-2 px-3">Avg Red</th>
                <th className="text-center py-2 px-3">Strictness</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((season, idx) => {
                const prevSeason = idx > 0 ? sortedData[idx - 1] : null;
                const yellowDiff = prevSeason ? season.avgYellowCards - prevSeason.avgYellowCards : 0;

                return (
                  <tr key={season.season} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-2 px-3 font-medium">{season.season}</td>
                    <td className="py-2 px-3 text-muted-foreground">{season.leagueName}</td>
                    <td className="py-2 px-3 text-center">{season.matchesOfficiated}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-yellow-500 font-medium">{season.avgYellowCards.toFixed(2)}</span>
                      {prevSeason && (
                        <span className={`text-xs ml-1 ${yellowDiff > 0 ? 'text-red-400' : yellowDiff < 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {yellowDiff > 0 ? '+' : ''}{yellowDiff.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center text-red-500 font-medium">
                      {season.avgRedCards.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`font-medium ${
                        season.strictnessIndex >= 7 ? 'text-red-500' :
                        season.strictnessIndex >= 5 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {season.strictnessIndex.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
