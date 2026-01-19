'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Bet {
  id: string;
  match: string;
  market: string;
  odds: number;
  stake: number;
  result: 'pending' | 'won' | 'lost' | 'void';
  potentialWin: number;
  actualWin: number;
  date: string;
  notes?: string;
}

interface Stats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  voidBets: number;
  winRate: number;
  totalStaked: number;
  totalReturns: number;
  profit: number;
  roi: number;
  avgOdds: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: { type: 'win' | 'lose'; count: number };
}

const STORAGE_KEY = 'reftrends_betting_history';

const marketOptions = [
  'Over 2.5 Cards',
  'Over 3.5 Cards',
  'Over 4.5 Cards',
  'Under 2.5 Cards',
  'Under 3.5 Cards',
  'Under 4.5 Cards',
  'Both Teams Carded',
  'Red Card in Match',
  'Home Team Over 1.5 Cards',
  'Away Team Over 1.5 Cards',
  'Other',
];

export default function BettingHistoryTracker() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');

  // Form state
  const [formData, setFormData] = useState({
    match: '',
    market: 'Over 3.5 Cards',
    odds: '',
    stake: '',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Load bets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load betting history:', error);
    }
    setIsLoading(false);
  }, []);

  // Save bets to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        const data = JSON.stringify(bets);
        localStorage.setItem(STORAGE_KEY, data);
      } catch (error) {
        // Handle quota exceeded or other storage errors
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('Storage quota exceeded. Consider exporting and clearing old bets.');
        } else {
          console.error('Failed to save betting history:', error);
        }
      }
    }
  }, [bets, isLoading]);

  // Calculate statistics
  const stats = useMemo<Stats>(() => {
    const completedBets = bets.filter(b => b.result === 'won' || b.result === 'lost');
    const wonBets = bets.filter(b => b.result === 'won');
    const lostBets = bets.filter(b => b.result === 'lost');
    const pendingBets = bets.filter(b => b.result === 'pending');
    const voidBets = bets.filter(b => b.result === 'void');

    const totalStaked = completedBets.reduce((sum, b) => sum + b.stake, 0);
    const totalReturns = wonBets.reduce((sum, b) => sum + b.actualWin, 0);
    const profit = totalReturns - totalStaked;
    const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0;
    const winRate = completedBets.length > 0
      ? (wonBets.length / completedBets.length) * 100
      : 0;
    const avgOdds = completedBets.length > 0
      ? completedBets.reduce((sum, b) => sum + b.odds, 0) / completedBets.length
      : 0;

    // Calculate streaks
    let longestWinStreak = 0;
    let longestLoseStreak = 0;
    let currentWinStreak = 0;
    let currentLoseStreak = 0;

    const sortedCompleted = [...completedBets].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedCompleted.forEach(bet => {
      if (bet.result === 'won') {
        currentWinStreak++;
        currentLoseStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentLoseStreak++;
        currentWinStreak = 0;
        longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
      }
    });

    const lastBet = sortedCompleted[sortedCompleted.length - 1];
    const currentStreak = lastBet
      ? lastBet.result === 'won'
        ? { type: 'win' as const, count: currentWinStreak }
        : { type: 'lose' as const, count: currentLoseStreak }
      : { type: 'win' as const, count: 0 };

    return {
      totalBets: bets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      pendingBets: pendingBets.length,
      voidBets: voidBets.length,
      winRate,
      totalStaked,
      totalReturns,
      profit,
      roi,
      avgOdds,
      longestWinStreak,
      longestLoseStreak,
      currentStreak,
    };
  }, [bets]);

  // Filter bets
  const filteredBets = useMemo(() => {
    let filtered = [...bets];

    // Filter by result
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.result === filter);
    }

    // Filter by date
    if (dateRange !== 'all') {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(b => new Date(b.date) >= cutoff);
    }

    // Sort by date descending
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bets, filter, dateRange]);

  const handleAddBet = useCallback(() => {
    const odds = parseFloat(formData.odds);
    const stake = parseFloat(formData.stake);

    // Validation with user feedback
    if (!formData.match.trim()) {
      setFormError('Match name is required');
      return;
    }
    if (isNaN(odds) || odds <= 1) {
      setFormError('Odds must be greater than 1.00');
      return;
    }
    if (isNaN(stake) || stake <= 0) {
      setFormError('Stake must be greater than 0');
      return;
    }

    setFormError(null);

    const newBet: Bet = {
      id: Date.now().toString(),
      match: formData.match.trim(),
      market: formData.market,
      odds,
      stake,
      result: 'pending',
      potentialWin: stake * odds,
      actualWin: 0,
      date: new Date().toISOString(),
      notes: formData.notes?.trim() || undefined,
    };

    setBets(prev => [newBet, ...prev]);
    setFormData({ match: '', market: 'Over 3.5 Cards', odds: '', stake: '', notes: '' });
    setShowAddForm(false);
  }, [formData]);

  const updateBetResult = useCallback((id: string, result: 'won' | 'lost' | 'void') => {
    setBets(prev =>
      prev.map(bet => {
        if (bet.id !== id) return bet;

        const actualWin = result === 'won'
          ? bet.stake * bet.odds
          : result === 'void'
            ? bet.stake
            : 0;

        return { ...bet, result, actualWin };
      })
    );
  }, []);

  const deleteBet = useCallback((id: string) => {
    setBets(prev => prev.filter(b => b.id !== id));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(bets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betting-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    // Delay URL revocation to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [bets]);

  // Validate a single bet object has required fields
  const isValidBet = (bet: unknown): bet is Bet => {
    if (typeof bet !== 'object' || bet === null) return false;
    const b = bet as Record<string, unknown>;
    return (
      typeof b.id === 'string' &&
      typeof b.match === 'string' &&
      typeof b.market === 'string' &&
      typeof b.odds === 'number' &&
      typeof b.stake === 'number' &&
      ['pending', 'won', 'lost', 'void'].includes(b.result as string) &&
      typeof b.potentialWin === 'number' &&
      typeof b.actualWin === 'number' &&
      typeof b.date === 'string'
    );
  };

  const importData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          // Validate each bet in the imported data
          const validBets = imported.filter(isValidBet);
          if (validBets.length === 0 && imported.length > 0) {
            console.error('Invalid import format: no valid bets found');
            return;
          }
          if (validBets.length < imported.length) {
            console.warn(`Imported ${validBets.length} of ${imported.length} bets. Some entries had invalid format.`);
          }
          setBets(validBets);
        } else {
          console.error('Invalid import format: expected an array');
        }
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
    // Reset file input to allow re-importing same file
    event.target.value = '';
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading betting history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className={`text-3xl font-bold ${stats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.wonBets}W / {stats.lostBets}L
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.profit >= 0 ? '+' : ''}{stats.profit.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Profit/Loss</div>
            <div className="text-xs text-muted-foreground mt-1">
              ROI: {stats.roi.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {stats.totalBets}
            </div>
            <div className="text-sm text-muted-foreground">Total Bets</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.pendingBets} pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className={`text-3xl font-bold ${
              stats.currentStreak.type === 'win' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.currentStreak.count}
            </div>
            <div className="text-sm text-muted-foreground">
              Current {stats.currentStreak.type === 'win' ? 'Win' : 'Lose'} Streak
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Best: {stats.longestWinStreak}W
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Performance Summary</span>
            {stats.winRate >= 50 && (
              <span className="text-sm px-2 py-1 rounded bg-green-500/20 text-green-400">
                Profitable
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Staked:</span>
              <span className="ml-2 font-bold">{stats.totalStaked.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Returns:</span>
              <span className="ml-2 font-bold">{stats.totalReturns.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Odds:</span>
              <span className="ml-2 font-bold">{stats.avgOdds.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longest Lose:</span>
              <span className="ml-2 font-bold">{stats.longestLoseStreak}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button onClick={() => { setShowAddForm(!showAddForm); setFormError(null); }}>
            {showAddForm ? 'Cancel' : 'Add Bet'}
          </Button>
          <Button variant="outline" onClick={exportData} disabled={bets.length === 0}>
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>Import</span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 rounded-lg bg-secondary text-sm"
            aria-label="Filter bets by result status"
          >
            <option value="all">All Results</option>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 rounded-lg bg-secondary text-sm"
            aria-label="Filter bets by date range"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Add Bet Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Bet</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" role="alert">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Match</label>
                <Input
                  placeholder="e.g., Arsenal vs Chelsea"
                  value={formData.match}
                  onChange={(e) => setFormData(prev => ({ ...prev, match: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Market</label>
                <select
                  value={formData.market}
                  onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm"
                  aria-label="Select betting market"
                >
                  {marketOptions.map(market => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Odds</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1.01"
                  placeholder="e.g., 1.85"
                  value={formData.odds}
                  onChange={(e) => setFormData(prev => ({ ...prev, odds: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Stake</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 10.00"
                  value={formData.stake}
                  onChange={(e) => setFormData(prev => ({ ...prev, stake: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Notes (optional)</label>
                <Input
                  placeholder="Any notes about this bet..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setShowAddForm(false); setFormError(null); }}>
                Cancel
              </Button>
              <Button onClick={handleAddBet}>
                Add Bet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bets List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Betting History
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredBets.length} bets)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-4 text-muted-foreground font-bold">[ ]</div>
              <p>No bets recorded yet.</p>
              <p className="text-sm">Start tracking your bets to see statistics!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBets.map(bet => (
                <div
                  key={bet.id}
                  className={`p-4 rounded-lg border ${
                    bet.result === 'won'
                      ? 'border-green-500/30 bg-green-500/5'
                      : bet.result === 'lost'
                        ? 'border-red-500/30 bg-red-500/5'
                        : bet.result === 'void'
                          ? 'border-gray-500/30 bg-gray-500/5'
                          : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold">{bet.match}</div>
                      <div className="text-sm text-muted-foreground">
                        {bet.market} @ {bet.odds.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(bet.date).toLocaleDateString()} | Stake: {bet.stake.toFixed(2)}
                        {bet.notes && <span className="ml-2">| {bet.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {bet.result === 'pending' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateBetResult(bet.id, 'won')}
                            className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            Won
                          </button>
                          <button
                            onClick={() => updateBetResult(bet.id, 'lost')}
                            className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            Lost
                          </button>
                          <button
                            onClick={() => updateBetResult(bet.id, 'void')}
                            className="px-2 py-1 text-xs rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          >
                            Void
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded font-bold ${
                              bet.result === 'won'
                                ? 'bg-green-500/20 text-green-400'
                                : bet.result === 'lost'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {bet.result === 'won' && `+${(bet.actualWin - bet.stake).toFixed(2)}`}
                            {bet.result === 'lost' && `-${bet.stake.toFixed(2)}`}
                            {bet.result === 'void' && 'Void'}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => deleteBet(bet.id)}
                        className="text-xs text-muted-foreground hover:text-red-400 mt-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">Betting Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Track all your bets for accurate statistics</li>
            <li>- Set a bankroll and stick to it</li>
            <li>- Review your history regularly to identify patterns</li>
            <li>- Export your data periodically as backup</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
