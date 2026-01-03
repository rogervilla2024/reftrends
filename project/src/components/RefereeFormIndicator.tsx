'use client';

import { useMemo } from 'react';

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
}

// Get form indicator based on total cards in a match
function getFormIndicator(yellow: number, red: number): { color: string; emoji: string; label: string } {
  const total = yellow + red * 2; // Red cards weighted more

  if (total >= 7) return { color: 'bg-red-500', emoji: '🔴', label: 'Very High' };
  if (total >= 5) return { color: 'bg-orange-500', emoji: '🟠', label: 'High' };
  if (total >= 3) return { color: 'bg-yellow-500', emoji: '🟡', label: 'Medium' };
  return { color: 'bg-green-500', emoji: '🟢', label: 'Low' };
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
            title={`${match.teams}\n${match.yellowCards}🟨 ${match.redCards}🟥\n${match.date}`}
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
      <span>{form.emoji}</span>
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
