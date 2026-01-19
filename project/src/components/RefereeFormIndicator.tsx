'use client';

import { useMemo } from 'react';
import { analyzeRefereeForm } from '@/lib/predictions';

interface MatchForm {
  yellowCards: number;
  redCards: number;
  date: string;
  teams: string;
}

interface RefereeFormIndicatorProps {
  matches: MatchForm[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  seasonAvg?: number;
}

// Get form indicator based on total cards in a match
function getFormIndicator(yellow: number, red: number): { color: string; symbol: string; label: string } {
  const total = yellow + red * 2; // Red cards weighted more

  if (total >= 7) return { color: 'bg-red-500', symbol: 'VH', label: 'Very High' };
  if (total >= 5) return { color: 'bg-orange-500', symbol: 'H', label: 'High' };
  if (total >= 3) return { color: 'bg-yellow-500', symbol: 'M', label: 'Medium' };
  return { color: 'bg-green-500', symbol: 'L', label: 'Low' };
}

export default function RefereeFormIndicator({
  matches,
  showLabels = false,
  size = 'md',
}: RefereeFormIndicatorProps) {
  const recentMatches = useMemo(() => {
    return matches.slice(0, 5).map(m => ({
      ...m,
      form: getFormIndicator(m.yellowCards, m.redCards),
      total: m.yellowCards + m.redCards,
    }));
  }, [matches]);

  if (recentMatches.length === 0) {
    return <span className="text-muted-foreground text-sm">No recent data</span>;
  }

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const avgCards = recentMatches.reduce((sum, m) => sum + m.total, 0) / recentMatches.length;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1" title="Last 5 matches card form">
        {recentMatches.map((match, idx) => (
          <div
            key={idx}
            className={`${sizeClasses[size]} ${match.form.color} rounded-full flex items-center justify-center cursor-help transition-transform hover:scale-110`}
            title={`${match.teams}\n${match.yellowCards}Y ${match.redCards}R\n${match.date}`}
          >
            {size === 'lg' && (
              <span className="text-white font-bold text-xs">{match.total}</span>
            )}
          </div>
        ))}
        {showLabels && (
          <span className="text-xs text-muted-foreground ml-2">
            Avg: {avgCards.toFixed(1)} cards
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for use in lists/cards
export function RefereeFormBadge({ matches }: { matches: MatchForm[] }) {
  const recentMatches = matches.slice(0, 5);

  if (recentMatches.length === 0) return null;

  const avgCards = recentMatches.reduce((sum, m) => sum + m.yellowCards + m.redCards, 0) / recentMatches.length;
  const form = getFormIndicator(avgCards, 0);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-4 h-4 rounded-full ${form.color} flex items-center justify-center text-white text-[10px] font-bold`}>{form.symbol}</span>
      <span className="text-muted-foreground">
        {avgCards.toFixed(1)} avg
      </span>
    </div>
  );
}

// Legend component
export function FormLegend() {
  const items = [
    { color: 'bg-green-500', label: 'Low (0-2 cards)' },
    { color: 'bg-yellow-500', label: 'Medium (3-4 cards)' },
    { color: 'bg-orange-500', label: 'High (5-6 cards)' },
    { color: 'bg-red-500', label: 'Very High (7+ cards)' },
  ];

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Detailed form analysis component
interface DetailedFormProps {
  matches: MatchForm[];
  seasonAvg: number;
  refereeName: string;
}

export function DetailedFormAnalysis({ matches, seasonAvg, refereeName }: DetailedFormProps) {
  const formAnalysis = useMemo(() => {
    const recentCards = matches.slice(0, 5).map(m => m.yellowCards + m.redCards);
    return analyzeRefereeForm(recentCards, seasonAvg);
  }, [matches, seasonAvg]);

  const getTrendInfo = () => {
    switch (formAnalysis.trend) {
      case 'improving':
        return { icon: 'v', text: 'Becoming Lenient', color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'declining':
        return { icon: '^', text: 'Becoming Stricter', color: 'text-red-500', bg: 'bg-red-500/10' };
      default:
        return { icon: '-', text: 'Consistent', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    }
  };

  const trendInfo = getTrendInfo();
  const maxCards = Math.max(...matches.slice(0, 5).map(m => m.yellowCards + m.redCards), 6);

  if (matches.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No recent match data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${trendInfo.bg} text-center`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-2xl ${trendInfo.color}`}>{trendInfo.icon}</span>
            <span className={`font-bold ${trendInfo.color}`}>{trendInfo.text}</span>
          </div>
          <p className="text-xs text-muted-foreground">Current Trend</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <div className="text-2xl font-bold text-primary">{formAnalysis.avgLast5.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Avg Last 5</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <div className="text-2xl font-bold">{formAnalysis.avgSeason.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Season Avg</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <div className={`text-2xl font-bold ${
            formAnalysis.formRating >= 7 ? 'text-green-500' :
            formAnalysis.formRating >= 4 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {formAnalysis.formRating}/10
          </div>
          <p className="text-xs text-muted-foreground">Consistency</p>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Last 5 Matches</h4>
        <div className="flex items-end gap-2 h-28">
          {matches.slice(0, 5).reverse().map((match, idx) => {
            const totalCards = match.yellowCards + match.redCards;
            const height = (totalCards / maxCards) * 100;
            const isAboveAvg = totalCards > seasonAvg;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group cursor-help">
                <div className="relative w-full">
                  <div
                    className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                      isAboveAvg ? 'bg-red-500/70' : 'bg-green-500/70'
                    }`}
                    style={{ height: `${Math.max(height, 15)}px`, minHeight: '15px' }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {match.teams}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-bold">{totalCards}</div>
                  <div className="text-xs text-muted-foreground">
                    {match.date.split(',')[0]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <div className="w-8 h-0.5 bg-yellow-500 border-dashed"></div>
          <span>Season Avg: {seasonAvg.toFixed(1)}</span>
        </div>
      </div>

      {/* Insights Box */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h4 className="font-bold mb-2">Betting Insights</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {formAnalysis.trend === 'declining' && (
            <li>- {refereeName} is showing more cards than usual recently</li>
          )}
          {formAnalysis.trend === 'improving' && (
            <li>- {refereeName} has been more lenient in recent matches</li>
          )}
          {formAnalysis.volatility > 2 && (
            <li>- High volatility: unpredictable card patterns, consider avoiding</li>
          )}
          {formAnalysis.volatility <= 1 && formAnalysis.formRating >= 7 && (
            <li>- Very consistent: reliable for card betting predictions</li>
          )}
          {formAnalysis.avgLast5 > formAnalysis.avgSeason + 0.5 && (
            <li>- Running {((formAnalysis.avgLast5 - formAnalysis.avgSeason) / formAnalysis.avgSeason * 100).toFixed(0)}% above season average - consider Over bets</li>
          )}
          {formAnalysis.avgLast5 < formAnalysis.avgSeason - 0.5 && (
            <li>- Running {((formAnalysis.avgSeason - formAnalysis.avgLast5) / formAnalysis.avgSeason * 100).toFixed(0)}% below season average - consider Under bets</li>
          )}
        </ul>
      </div>
    </div>
  );
}
