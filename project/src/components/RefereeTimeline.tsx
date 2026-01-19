'use client';

import { useMemo } from 'react';

interface SeasonStats {
  season: number;
  leagueName: string;
  matchesOfficiated: number;
  avgYellowCards: number;
  avgRedCards: number;
  strictnessIndex: number;
  totalYellowCards: number;
  totalRedCards: number;
}

interface Props {
  seasonStats: SeasonStats[];
  refereeName: string;
}

function formatSeason(year: number): string {
  return `${year - 1}/${year.toString().slice(-2)}`;
}

export default function RefereeTimeline({ seasonStats, refereeName }: Props) {
  const sortedStats = useMemo(
    () => [...seasonStats].sort((a, b) => a.season - b.season),
    [seasonStats]
  );

  const trends = useMemo(() => {
    if (sortedStats.length < 2) return null;

    const first = sortedStats[0];
    const last = sortedStats[sortedStats.length - 1];

    return {
      strictnessChange: last.strictnessIndex - first.strictnessIndex,
      yellowChange: last.avgYellowCards - first.avgYellowCards,
      totalMatches: sortedStats.reduce((sum, s) => sum + s.matchesOfficiated, 0),
      totalSeasons: sortedStats.length,
    };
  }, [sortedStats]);

  if (sortedStats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No historical data available
      </div>
    );
  }

  const maxStrictness = Math.max(...sortedStats.map(s => s.strictnessIndex), 10);
  const maxMatches = Math.max(...sortedStats.map(s => s.matchesOfficiated), 1);

  return (
    <div className="space-y-6">
      {/* Career Summary */}
      {trends && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/30 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{trends.totalSeasons}</div>
            <div className="text-xs text-muted-foreground">Seasons Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{trends.totalMatches}</div>
            <div className="text-xs text-muted-foreground">Total Matches</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${trends.strictnessChange > 0 ? 'text-red-500' : trends.strictnessChange < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
              {trends.strictnessChange > 0 ? '+' : ''}{trends.strictnessChange.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Strictness Change</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${trends.yellowChange > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {trends.yellowChange > 0 ? '+' : ''}{trends.yellowChange.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Yellow Change</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border transform -translate-x-1/2" />

        {/* Season Nodes */}
        <div className="space-y-8">
          {sortedStats.map((stat, idx) => {
            const isLeft = idx % 2 === 0;
            const strictnessHeight = (stat.strictnessIndex / maxStrictness) * 100;
            const matchesWidth = (stat.matchesOfficiated / maxMatches) * 100;

            return (
              <div
                key={stat.season}
                className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block bg-card border border-border rounded-xl p-4 max-w-sm ${isLeft ? 'mr-4' : 'ml-4'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{formatSeason(stat.season)}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {stat.leagueName}
                      </span>
                    </div>

                    {/* Strictness Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Strictness</span>
                        <span className="font-medium">{stat.strictnessIndex.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all"
                          style={{ width: `${strictnessHeight}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-bold">{stat.matchesOfficiated}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                      <div>
                        <div className="font-bold text-yellow-500">{stat.avgYellowCards.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Yellow</div>
                      </div>
                      <div>
                        <div className="font-bold text-red-500">{stat.avgRedCards.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Avg Red</div>
                      </div>
                    </div>

                    {/* Matches Progress */}
                    <div className="mt-3">
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${matchesWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold border-4 border-background">
                  {idx + 1}
                </div>

                {/* Empty Space */}
                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend Arrow */}
      {trends && sortedStats.length >= 2 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Career Trend</div>
            <div className={`text-lg font-bold ${
              trends.strictnessChange > 0.5 ? 'text-red-500' :
              trends.strictnessChange < -0.5 ? 'text-green-500' :
              'text-muted-foreground'
            }`}>
              {trends.strictnessChange > 0.5 ? 'Becoming Stricter ^' :
               trends.strictnessChange < -0.5 ? 'Becoming Lenient v' :
               'Consistent Style -'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
