'use client';

interface StatsData {
  avgYellowCards: number;
  avgRedCards: number;
  avgPenalties: number;
  strictnessIndex: number;
  homeBiasScore: number;
  matchesOfficiated: number;
  leagueAvgYellow?: number;
  leagueAvgRed?: number;
  previousSeasonStrictness?: number;
}

interface Props {
  stats: StatsData;
  refereeName: string;
}

function TrendIndicator({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;

  const diff = current - previous;
  const pctChange = previous > 0 ? ((diff / previous) * 100) : 0;

  if (Math.abs(pctChange) < 5) {
    return <span className="text-muted-foreground text-xs ml-1">-</span>;
  }

  if (diff > 0) {
    return (
      <span className="text-red-500 text-xs ml-1" title={`+${pctChange.toFixed(0)}% from last season`}>
        ^
      </span>
    );
  }

  return (
    <span className="text-green-500 text-xs ml-1" title={`${pctChange.toFixed(0)}% from last season`}>
      v
    </span>
  );
}

function ComparisonBar({ value, average, label }: { value: number; average?: number; label: string }) {
  if (!average) return null;

  const ratio = value / average;
  const barWidth = Math.min(ratio * 50, 100);
  const isAboveAverage = ratio > 1;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>vs League Avg</span>
        <span className={isAboveAverage ? 'text-red-400' : 'text-green-400'}>
          {isAboveAverage ? '+' : ''}{((ratio - 1) * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAboveAverage ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

export default function RefereeStatsCards({ stats, refereeName }: Props) {
  const getStrictnessLabel = (index: number) => {
    if (index >= 8) return { label: 'Very Strict', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (index >= 6) return { label: 'Strict', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    if (index >= 4) return { label: 'Average', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (index >= 2) return { label: 'Lenient', color: 'text-green-500', bg: 'bg-green-500/10' };
    return { label: 'Very Lenient', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const getBiasLabel = (score: number) => {
    if (score >= 0.3) return { label: 'Home Bias', color: 'text-blue-500' };
    if (score <= -0.3) return { label: 'Away Bias', color: 'text-purple-500' };
    return { label: 'Neutral', color: 'text-muted-foreground' };
  };

  const strictness = getStrictnessLabel(stats.strictnessIndex);
  const bias = getBiasLabel(stats.homeBiasScore);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Yellow Cards */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Yellow</span>
          <span className="text-yellow-500 text-sm font-bold">Y</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-yellow-500">
            {stats.avgYellowCards.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/match</span>
          <TrendIndicator current={stats.avgYellowCards} previous={stats.leagueAvgYellow} />
        </div>
        <ComparisonBar value={stats.avgYellowCards} average={stats.leagueAvgYellow} label="yellow" />
      </div>

      {/* Red Cards */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Red</span>
          <span className="text-red-500 text-sm font-bold">R</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-red-500">
            {stats.avgRedCards.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/match</span>
        </div>
        <ComparisonBar value={stats.avgRedCards} average={stats.leagueAvgRed} label="red" />
      </div>

      {/* Penalties */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Penalties</span>
          <span className="text-blue-500 text-sm font-bold">PK</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-500">
            {stats.avgPenalties.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/match</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.avgPenalties >= 0.3 ? 'Above average' : stats.avgPenalties >= 0.15 ? 'Average' : 'Below average'}
        </p>
      </div>

      {/* Strictness */}
      <div className={`rounded-xl p-4 ${strictness.bg} border border-border`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Strictness</span>
          <TrendIndicator current={stats.strictnessIndex} previous={stats.previousSeasonStrictness} />
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${strictness.color}`}>
            {stats.strictnessIndex.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/10</span>
        </div>
        <p className={`text-sm font-medium mt-2 ${strictness.color}`}>
          {strictness.label}
        </p>
      </div>

      {/* Home Bias */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Home Bias</span>
          <span className="text-sm font-bold">H</span>
        </div>
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${bias.color}`}>
            {stats.homeBiasScore >= 0 ? '+' : ''}{stats.homeBiasScore.toFixed(2)}
          </span>
        </div>
        <p className={`text-sm font-medium mt-2 ${bias.color}`}>
          {bias.label}
        </p>
      </div>

      {/* Matches */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Matches</span>
          <span className="text-sm font-bold">#</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-primary">
            {stats.matchesOfficiated}
          </span>
          <span className="text-sm text-muted-foreground ml-1">this season</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.matchesOfficiated >= 20 ? 'High sample' : stats.matchesOfficiated >= 10 ? 'Good sample' : 'Limited data'}
        </p>
      </div>
    </div>
  );
}
