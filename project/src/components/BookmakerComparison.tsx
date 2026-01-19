'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BookmakerOdds {
  bookmaker: string;
  over25: number;
  under25: number;
  over35: number;
  under35: number;
  over45: number;
  under45: number;
  margin: number;
}

interface Market {
  name: string;
  overKey: keyof BookmakerOdds;
  underKey: keyof BookmakerOdds;
}

const BOOKMAKERS = [
  'Bet365',
  'William Hill',
  'Betfair',
  'Unibet',
  '1xBet',
  'Pinnacle',
  'Betway',
  '888sport',
];

const MARKETS: Market[] = [
  { name: '2.5 Cards', overKey: 'over25', underKey: 'under25' },
  { name: '3.5 Cards', overKey: 'over35', underKey: 'under35' },
  { name: '4.5 Cards', overKey: 'over45', underKey: 'under45' },
];

// Generate realistic simulated odds for each bookmaker
const generateBookmakerOdds = (baseExpected: number): BookmakerOdds[] => {
  return BOOKMAKERS.map((bookmaker) => {
    // Different bookmakers have different margins (3-8%)
    const marginVariation = Math.random() * 0.05 + 0.03;

    // Simulate odds based on expected cards with some variance per bookmaker
    const variance = (Math.random() - 0.5) * 0.1;
    const adjusted = baseExpected + variance;

    // Calculate fair probabilities
    const prob25 = Math.min(0.95, Math.max(0.05, 0.3 + (adjusted - 2.5) * 0.15));
    const prob35 = Math.min(0.95, Math.max(0.05, 0.5 + (adjusted - 3.5) * 0.15));
    const prob45 = Math.min(0.95, Math.max(0.05, 0.7 + (adjusted - 4.5) * 0.15));

    // Convert to odds with margin
    const over25 = Math.round((1 / prob25) * (1 - marginVariation / 2) * 100) / 100;
    const under25 = Math.round((1 / (1 - prob25)) * (1 - marginVariation / 2) * 100) / 100;
    const over35 = Math.round((1 / prob35) * (1 - marginVariation / 2) * 100) / 100;
    const under35 = Math.round((1 / (1 - prob35)) * (1 - marginVariation / 2) * 100) / 100;
    const over45 = Math.round((1 / prob45) * (1 - marginVariation / 2) * 100) / 100;
    const under45 = Math.round((1 / (1 - prob45)) * (1 - marginVariation / 2) * 100) / 100;

    // Calculate actual margin
    const margin25 = ((1 / over25) + (1 / under25) - 1) * 100;
    const margin35 = ((1 / over35) + (1 / under35) - 1) * 100;
    const margin45 = ((1 / over45) + (1 / under45) - 1) * 100;
    const avgMargin = (margin25 + margin35 + margin45) / 3;

    return {
      bookmaker,
      over25,
      under25,
      over35,
      under35,
      over45,
      under45,
      margin: Math.round(avgMargin * 100) / 100,
    };
  });
};

export default function BookmakerComparison() {
  const [expectedCards, setExpectedCards] = useState(3.5);
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKETS[1]);
  const [odds, setOdds] = useState<BookmakerOdds[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate odds on client side only to avoid SSR hydration mismatch
  useEffect(() => {
    setOdds(generateBookmakerOdds(expectedCards));
    setIsLoading(false);
  }, []);

  // Regenerate odds when expected cards changes
  const handleExpectedCardsChange = (value: number) => {
    setExpectedCards(value);
    setOdds(generateBookmakerOdds(value));
  };

  // Find best odds for each market
  const bestOdds = useMemo(() => {
    const best: Record<string, { value: number; bookmaker: string }> = {};

    MARKETS.forEach((market) => {
      let bestOver = { value: 0, bookmaker: '' };
      let bestUnder = { value: 0, bookmaker: '' };

      odds.forEach((o) => {
        const overValue = o[market.overKey] as number;
        const underValue = o[market.underKey] as number;

        if (overValue > bestOver.value) {
          bestOver = { value: overValue, bookmaker: o.bookmaker };
        }
        if (underValue > bestUnder.value) {
          bestUnder = { value: underValue, bookmaker: o.bookmaker };
        }
      });

      best[market.overKey] = bestOver;
      best[market.underKey] = bestUnder;
    });

    return best;
  }, [odds]);

  // Check for arbitrage opportunities
  const arbitrageOpportunities = useMemo(() => {
    const opportunities: Array<{
      market: string;
      overBookmaker: string;
      overOdds: number;
      underBookmaker: string;
      underOdds: number;
      profit: number;
    }> = [];

    MARKETS.forEach((market) => {
      const bestOver = bestOdds[market.overKey];
      const bestUnder = bestOdds[market.underKey];

      const totalImplied = (1 / bestOver.value) + (1 / bestUnder.value);

      if (totalImplied < 1) {
        const profit = ((1 / totalImplied) - 1) * 100;
        opportunities.push({
          market: market.name,
          overBookmaker: bestOver.bookmaker,
          overOdds: bestOver.value,
          underBookmaker: bestUnder.bookmaker,
          underOdds: bestUnder.value,
          profit: Math.round(profit * 100) / 100,
        });
      }
    });

    return opportunities;
  }, [bestOdds]);

  // Calculate value rating
  const getValueRating = (odds: number, bestValue: number): 'best' | 'good' | 'average' | 'poor' => {
    const diff = ((bestValue - odds) / bestValue) * 100;
    if (diff === 0) return 'best';
    if (diff < 2) return 'good';
    if (diff < 5) return 'average';
    return 'poor';
  };

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
              <label className="text-sm text-muted-foreground mb-2 block">
                Expected Cards (based on referee stats)
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="8"
                value={expectedCards}
                onChange={(e) => handleExpectedCardsChange(parseFloat(e.target.value) || 3.5)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Focus Market
              </label>
              <select
                value={selectedMarket.name}
                onChange={(e) => setSelectedMarket(MARKETS.find(m => m.name === e.target.value) || MARKETS[1])}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm"
              >
                {MARKETS.map((market) => (
                  <option key={market.name} value={market.name}>
                    Over/Under {market.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Alert */}
      {arbitrageOpportunities.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              Arbitrage Opportunity Detected!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {arbitrageOpportunities.map((arb, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-green-500/10 mb-2">
                <div className="font-bold text-lg mb-2">
                  Over/Under {arb.market} - {arb.profit.toFixed(2)}% Profit
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Over:</span>{' '}
                    <span className="font-bold">{arb.overBookmaker}</span> @ {arb.overOdds.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Under:</span>{' '}
                    <span className="font-bold">{arb.underBookmaker}</span> @ {arb.underOdds.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Odds Comparison - Over/Under {selectedMarket.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Loading odds data...
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="text-left py-3 px-4">Bookmaker</th>
                  <th className="text-center py-3 px-4">Over {selectedMarket.name}</th>
                  <th className="text-center py-3 px-4">Under {selectedMarket.name}</th>
                  <th className="text-center py-3 px-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {odds.sort((a, b) => a.margin - b.margin).map((o) => {
                  const overValue = o[selectedMarket.overKey] as number;
                  const underValue = o[selectedMarket.underKey] as number;
                  const overRating = getValueRating(overValue, bestOdds[selectedMarket.overKey].value);
                  const underRating = getValueRating(underValue, bestOdds[selectedMarket.underKey].value);

                  return (
                    <tr key={o.bookmaker} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="py-3 px-4 font-medium">{o.bookmaker}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded font-mono ${
                            overRating === 'best'
                              ? 'bg-green-500/20 text-green-400 font-bold'
                              : overRating === 'good'
                                ? 'bg-blue-500/20 text-blue-400'
                                : overRating === 'average'
                                  ? 'text-muted-foreground'
                                  : 'text-red-400/70'
                          }`}
                        >
                          {overValue.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded font-mono ${
                            underRating === 'best'
                              ? 'bg-green-500/20 text-green-400 font-bold'
                              : underRating === 'good'
                                ? 'bg-blue-500/20 text-blue-400'
                                : underRating === 'average'
                                  ? 'text-muted-foreground'
                                  : 'text-red-400/70'
                          }`}
                        >
                          {underValue.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs ${
                            o.margin < 4 ? 'text-green-400' : o.margin < 6 ? 'text-yellow-400' : 'text-red-400'
                          }`}
                        >
                          {o.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* All Markets Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Best Odds Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MARKETS.map((market) => {
              const bestOver = bestOdds[market.overKey];
              const bestUnder = bestOdds[market.underKey];

              return (
                <div key={market.name} className="p-4 rounded-lg bg-secondary/20">
                  <h4 className="font-bold mb-3">Over/Under {market.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Over:</span>
                      <span>
                        <span className="font-bold text-green-400">{bestOver.value.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-1">({bestOver.bookmaker})</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Under:</span>
                      <span>
                        <span className="font-bold text-green-400">{bestUnder.value.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-1">({bestUnder.bookmaker})</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bookmaker Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Bookmaker Rankings by Margin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {odds
              .sort((a, b) => a.margin - b.margin)
              .map((o, idx) => (
                <div
                  key={o.bookmaker}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-yellow-500 text-black'
                          : idx === 1
                            ? 'bg-gray-400 text-black'
                            : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-secondary'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium">{o.bookmaker}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-mono ${
                        o.margin < 4 ? 'text-green-400' : o.margin < 6 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {o.margin.toFixed(1)}% margin
                    </span>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          o.margin < 4 ? 'bg-green-500' : o.margin < 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, o.margin * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">How to Use This Tool</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Green highlighted odds are the best available for that market</li>
            <li>- Lower margin means better value for bettors</li>
            <li>- Pinnacle typically has the lowest margins in the industry</li>
            <li>- Always shop around for the best odds before placing bets</li>
            <li>- Arbitrage opportunities are rare but can provide risk-free profit</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/80">
        <strong>Disclaimer:</strong> These odds are simulated for educational purposes only.
        Actual bookmaker odds vary in real-time. Always verify current odds before placing any bets.
        Gambling involves risk - please bet responsibly.
      </div>
    </div>
  );
}
