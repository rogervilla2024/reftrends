'use client';

import { useMemo } from 'react';

interface CardEvent {
  minute: number;
  type: 'yellow' | 'red';
}

interface Props {
  cardEvents: CardEvent[];
  title?: string;
  showLegend?: boolean;
}

// Group minutes into 15-minute intervals
const TIME_INTERVALS = [
  { label: '0-15', start: 0, end: 15 },
  { label: '16-30', start: 16, end: 30 },
  { label: '31-45', start: 31, end: 45 },
  { label: '45+', start: 45, end: 48 },
  { label: '46-60', start: 46, end: 60 },
  { label: '61-75', start: 61, end: 75 },
  { label: '76-90', start: 76, end: 90 },
  { label: '90+', start: 90, end: 120 },
];

export default function CardHeatmap({ cardEvents, title = 'Card Distribution by Minute', showLegend = true }: Props) {
  const heatmapData = useMemo(() => {
    const yellowByInterval: Record<string, number> = {};
    const redByInterval: Record<string, number> = {};

    TIME_INTERVALS.forEach(interval => {
      yellowByInterval[interval.label] = 0;
      redByInterval[interval.label] = 0;
    });

    cardEvents.forEach(event => {
      const interval = TIME_INTERVALS.find(i =>
        event.minute >= i.start && event.minute <= i.end
      );
      if (interval) {
        if (event.type === 'yellow') {
          yellowByInterval[interval.label]++;
        } else {
          redByInterval[interval.label]++;
        }
      }
    });

    const totalYellow = Object.values(yellowByInterval).reduce((a, b) => a + b, 0);
    const totalRed = Object.values(redByInterval).reduce((a, b) => a + b, 0);

    return TIME_INTERVALS.map(interval => ({
      label: interval.label,
      yellow: yellowByInterval[interval.label],
      red: redByInterval[interval.label],
      yellowPct: totalYellow > 0 ? (yellowByInterval[interval.label] / totalYellow) * 100 : 0,
      redPct: totalRed > 0 ? (redByInterval[interval.label] / totalRed) * 100 : 0,
      total: yellowByInterval[interval.label] + redByInterval[interval.label],
    }));
  }, [cardEvents]);

  const maxTotal = Math.max(...heatmapData.map(d => d.total), 1);

  const getHeatColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity === 0) return 'bg-secondary/30';
    if (intensity < 0.25) return 'bg-yellow-500/20';
    if (intensity < 0.5) return 'bg-yellow-500/40';
    if (intensity < 0.75) return 'bg-orange-500/60';
    return 'bg-red-500/80';
  };

  const totalCards = cardEvents.length;
  const yellowCards = cardEvents.filter(e => e.type === 'yellow').length;
  const redCards = cardEvents.filter(e => e.type === 'red').length;

  if (cardEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No card data available for heatmap visualization
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="font-bold text-lg">{title}</h3>}

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-yellow-500"></span>
          <span>Yellow: {yellowCards}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span>Red: {redCards}</span>
        </div>
        <div className="text-muted-foreground">Total: {totalCards}</div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2">
        {/* First Half */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">First Half</p>
          <div className="grid grid-cols-4 gap-1">
            {heatmapData.slice(0, 4).map(data => (
              <div
                key={data.label}
                className={`p-3 rounded-lg text-center transition-colors ${getHeatColor(data.total, maxTotal)}`}
              >
                <div className="text-xs text-muted-foreground mb-1">{data.label}&apos;</div>
                <div className="text-lg font-bold">{data.total}</div>
                <div className="flex justify-center gap-2 text-xs mt-1">
                  <span className="text-yellow-500">{data.yellow}</span>
                  <span className="text-red-500">{data.red}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Half */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Second Half</p>
          <div className="grid grid-cols-4 gap-1">
            {heatmapData.slice(4).map(data => (
              <div
                key={data.label}
                className={`p-3 rounded-lg text-center transition-colors ${getHeatColor(data.total, maxTotal)}`}
              >
                <div className="text-xs text-muted-foreground mb-1">{data.label}&apos;</div>
                <div className="text-lg font-bold">{data.total}</div>
                <div className="flex justify-center gap-2 text-xs mt-1">
                  <span className="text-yellow-500">{data.yellow}</span>
                  <span className="text-red-500">{data.red}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Percentage Bar */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Distribution (%)</p>
        <div className="flex h-6 rounded-lg overflow-hidden">
          {heatmapData.map((data, idx) => (
            <div
              key={data.label}
              className={`flex items-center justify-center text-xs font-medium ${
                idx < 4 ? 'bg-blue-500/40' : 'bg-green-500/40'
              }`}
              style={{ width: `${(data.total / totalCards) * 100}%` }}
              title={`${data.label}: ${((data.total / totalCards) * 100).toFixed(1)}%`}
            >
              {(data.total / totalCards) * 100 >= 8 && (
                <span>{((data.total / totalCards) * 100).toFixed(0)}%</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1st Half</span>
          <span>2nd Half</span>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Intensity:</span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-secondary/30"></span>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-yellow-500/40"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-orange-500/60"></span>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-red-500/80"></span>
            <span>Very High</span>
          </div>
        </div>
      )}
    </div>
  );
}
