'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface OddsDataPoint {
  time: string;
  timestamp: number;
  over35: number;
  under35: number;
  over25: number;
  under25: number;
  over45: number;
  under45: number;
}

interface MarketMovement {
  market: string;
  opening: number;
  current: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  volatility: 'high' | 'medium' | 'low';
}

// Generate realistic simulated odds movement data
const generateOddsHistory = (days: number): OddsDataPoint[] => {
  const data: OddsDataPoint[] = [];
  const now = new Date();

  // Starting odds
  let over25 = 1.50 + Math.random() * 0.3;
  let under25 = 2.40 + Math.random() * 0.4;
  let over35 = 1.90 + Math.random() * 0.3;
  let under35 = 1.90 + Math.random() * 0.3;
  let over45 = 2.50 + Math.random() * 0.4;
  let under45 = 1.50 + Math.random() * 0.2;

  for (let i = days * 24; i >= 0; i -= 4) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);

    // Simulate odds movement with random walks
    const volatility = i < 24 ? 0.03 : 0.01; // More volatile close to kick-off

    over25 += (Math.random() - 0.5) * volatility;
    under25 += (Math.random() - 0.5) * volatility;
    over35 += (Math.random() - 0.5) * volatility;
    under35 += (Math.random() - 0.5) * volatility;
    over45 += (Math.random() - 0.5) * volatility;
    under45 += (Math.random() - 0.5) * volatility;

    // Keep odds within realistic bounds
    over25 = Math.max(1.20, Math.min(2.50, over25));
    under25 = Math.max(1.50, Math.min(3.50, under25));
    over35 = Math.max(1.50, Math.min(3.00, over35));
    under35 = Math.max(1.50, Math.min(3.00, under35));
    over45 = Math.max(1.80, Math.min(4.00, over45));
    under45 = Math.max(1.20, Math.min(2.50, under45));

    const hours = Math.floor(i);
    const label = hours === 0
      ? 'Now'
      : hours < 24
        ? `-${hours}h`
        : `-${Math.floor(hours / 24)}d`;

    data.push({
      time: label,
      timestamp: time.getTime(),
      over25: Math.round(over25 * 100) / 100,
      under25: Math.round(under25 * 100) / 100,
      over35: Math.round(over35 * 100) / 100,
      under35: Math.round(under35 * 100) / 100,
      over45: Math.round(over45 * 100) / 100,
      under45: Math.round(under45 * 100) / 100,
    });
  }

  return data;
};

export default function OddsMovementChart() {
  const [timeframe, setTimeframe] = useState<'1d' | '3d' | '7d'>('3d');
  const [selectedMarket, setSelectedMarket] = useState<'2.5' | '3.5' | '4.5'>('3.5');
  const [oddsData, setOddsData] = useState<OddsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = timeframe === '1d' ? 1 : timeframe === '3d' ? 3 : 7;

  // Generate data on client side only to avoid SSR hydration mismatch
  useEffect(() => {
    setIsLoading(true);
    const data = generateOddsHistory(days);
    setOddsData(data);
    setIsLoading(false);
  }, [days]);

  // Calculate market movements
  const marketMovements = useMemo<MarketMovement[]>(() => {
    if (oddsData.length < 2) return [];

    const first = oddsData[0];
    const last = oddsData[oddsData.length - 1];

    const markets: { name: string; openKey: keyof OddsDataPoint; currentKey: keyof OddsDataPoint }[] = [
      { name: 'Over 2.5 Cards', openKey: 'over25', currentKey: 'over25' },
      { name: 'Under 2.5 Cards', openKey: 'under25', currentKey: 'under25' },
      { name: 'Over 3.5 Cards', openKey: 'over35', currentKey: 'over35' },
      { name: 'Under 3.5 Cards', openKey: 'under35', currentKey: 'under35' },
      { name: 'Over 4.5 Cards', openKey: 'over45', currentKey: 'over45' },
      { name: 'Under 4.5 Cards', openKey: 'under45', currentKey: 'under45' },
    ];

    return markets.map(m => {
      const opening = first[m.openKey] as number;
      const current = last[m.currentKey] as number;
      const change = current - opening;
      const changePercent = (change / opening) * 100;

      // Calculate volatility
      const values = oddsData.map(d => d[m.openKey] as number);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = max - min;
      const avgOdds = values.reduce((a, b) => a + b, 0) / values.length;
      const volatilityScore = (range / avgOdds) * 100;

      return {
        market: m.name,
        opening,
        current,
        change,
        changePercent,
        trend: Math.abs(change) < 0.02 ? 'stable' : change > 0 ? 'up' : 'down',
        volatility: volatilityScore > 5 ? 'high' : volatilityScore > 2 ? 'medium' : 'low',
      };
    });
  }, [oddsData]);

  const overKey = `over${selectedMarket.replace('.', '')}` as keyof OddsDataPoint;
  const underKey = `under${selectedMarket.replace('.', '')}` as keyof OddsDataPoint;

  // Find significant movements (steam moves)
  const steamMoves = useMemo(() => {
    return marketMovements
      .filter(m => Math.abs(m.changePercent) > 3)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [marketMovements]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Timeframe</label>
              <div className="flex gap-2">
                {(['1d', '3d', '7d'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {tf === '1d' ? '24 Hours' : tf === '3d' ? '3 Days' : '7 Days'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Market</label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value as typeof selectedMarket)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm"
              >
                <option value="2.5">Over/Under 2.5 Cards</option>
                <option value="3.5">Over/Under 3.5 Cards</option>
                <option value="4.5">Over/Under 4.5 Cards</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steam Moves Alert */}
      {steamMoves.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              Significant Odds Movement Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steamMoves.slice(0, 4).map((move, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-500/10">
                  <div className="font-bold">{move.market}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">{move.opening.toFixed(2)}</span>
                    <span className="text-muted-foreground">-&gt;</span>
                    <span className={move.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                      {move.current.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-1 rounded ${
                        move.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {move.changePercent > 0 ? '+' : ''}{move.changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Odds Movement - Over/Under {selectedMarket} Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={oddsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value) => [(value as number).toFixed(2), '']}
                />
                <Legend />
                <ReferenceLine y={2.0} stroke="hsl(var(--border))" strokeDasharray="5 5" />
                <Line
                  type="monotone"
                  dataKey={overKey}
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                  name={`Over ${selectedMarket}`}
                />
                <Line
                  type="monotone"
                  dataKey={underKey}
                  stroke="hsl(var(--red-card))"
                  strokeWidth={2}
                  dot={false}
                  name={`Under ${selectedMarket}`}
                />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Markets Summary */}
      <Card>
        <CardHeader>
          <CardTitle>All Markets Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="text-left py-3 px-4">Market</th>
                  <th className="text-center py-3 px-4">Opening</th>
                  <th className="text-center py-3 px-4">Current</th>
                  <th className="text-center py-3 px-4">Change</th>
                  <th className="text-center py-3 px-4">Trend</th>
                  <th className="text-center py-3 px-4">Volatility</th>
                </tr>
              </thead>
              <tbody>
                {marketMovements.map((m, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 px-4 font-medium">{m.market}</td>
                    <td className="py-3 px-4 text-center font-mono">{m.opening.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{m.current.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          m.trend === 'up'
                            ? 'bg-green-500/20 text-green-400'
                            : m.trend === 'down'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {m.changePercent > 0 ? '+' : ''}{m.changePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={
                          m.trend === 'up'
                            ? 'text-green-400'
                            : m.trend === 'down'
                              ? 'text-red-400'
                              : 'text-gray-400'
                        }
                      >
                        {m.trend === 'up' ? 'Shortening' : m.trend === 'down' ? 'Drifting' : 'Stable'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          m.volatility === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : m.volatility === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {m.volatility}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-3">Understanding Odds Movement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">Shortening Odds</h4>
              <p>When odds decrease, more money is being placed on that outcome.
                 This could indicate sharp money or insider knowledge.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Drifting Odds</h4>
              <p>When odds increase, less money is coming in. This could be due to
                 news affecting the match or market balancing.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Steam Moves</h4>
              <p>Sudden, significant changes (3%+) often indicate professional
                 betting activity. These are worth monitoring closely.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Volatility</h4>
              <p>High volatility suggests uncertain markets. Low volatility
                 indicates stable opinion on the likely outcome.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/80">
        <strong>Disclaimer:</strong> This odds movement data is simulated for educational purposes.
        Real odds movements depend on market conditions, news, and betting patterns.
        Always monitor live odds from actual bookmakers before placing bets.
      </div>
    </div>
  );
}
