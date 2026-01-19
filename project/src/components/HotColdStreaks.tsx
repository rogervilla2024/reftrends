'use client';

import { useMemo } from 'react';

interface MatchData {
  date: string;
  homeTeam: string;
  awayTeam: string;
  yellowCards: number;
  redCards: number;
  penalties: number;
  totalCards: number;
}

interface Props {
  recentMatches: MatchData[];
  refereeAvgYellow: number;
  refereeAvgRed: number;
}

interface Streak {
  type: 'hot' | 'cold' | 'neutral';
  description: string;
  matches: number;
  significance: 'high' | 'medium' | 'low';
  bettingImplication: string;
}

export default function HotColdStreaks({
  recentMatches,
  refereeAvgYellow,
  refereeAvgRed,
}: Props) {
  const avgTotal = refereeAvgYellow + refereeAvgRed;

  // Analyze streaks
  const streaks = useMemo(() => {
    if (recentMatches.length < 3) return [];

    const foundStreaks: Streak[] = [];
    const last5 = recentMatches.slice(0, 5);
    const last3 = recentMatches.slice(0, 3);

    // Check for high card streaks (5+ cards)
    const highCardStreak = last5.filter(m => m.totalCards >= 5).length;
    if (highCardStreak >= 3) {
      foundStreaks.push({
        type: 'hot',
        description: `${highCardStreak} of last 5 matches with 5+ cards`,
        matches: highCardStreak,
        significance: highCardStreak >= 4 ? 'high' : 'medium',
        bettingImplication: 'Consider Over 4.5 cards',
      });
    }

    // Check for low card streaks (under 3 cards)
    const lowCardStreak = last5.filter(m => m.totalCards < 3).length;
    if (lowCardStreak >= 3) {
      foundStreaks.push({
        type: 'cold',
        description: `${lowCardStreak} of last 5 matches with under 3 cards`,
        matches: lowCardStreak,
        significance: lowCardStreak >= 4 ? 'high' : 'medium',
        bettingImplication: 'Consider Under 3.5 cards',
      });
    }

    // Check for consistent over 3.5 streak
    const over35Streak = countConsecutive(last5, m => m.totalCards > 3.5);
    if (over35Streak >= 3) {
      foundStreaks.push({
        type: 'hot',
        description: `${over35Streak} consecutive matches with over 3.5 cards`,
        matches: over35Streak,
        significance: over35Streak >= 4 ? 'high' : 'medium',
        bettingImplication: 'Hot streak - Over 3.5 recommended',
      });
    }

    // Check for consistent under 3.5 streak
    const under35Streak = countConsecutive(last5, m => m.totalCards <= 3.5);
    if (under35Streak >= 3) {
      foundStreaks.push({
        type: 'cold',
        description: `${under35Streak} consecutive matches with under 3.5 cards`,
        matches: under35Streak,
        significance: under35Streak >= 4 ? 'high' : 'medium',
        bettingImplication: 'Cold streak - Under 3.5 recommended',
      });
    }

    // Check for red card tendency
    const redCardMatches = last5.filter(m => m.redCards > 0).length;
    if (redCardMatches >= 2) {
      foundStreaks.push({
        type: 'hot',
        description: `Red card shown in ${redCardMatches} of last 5 matches`,
        matches: redCardMatches,
        significance: redCardMatches >= 3 ? 'high' : 'medium',
        bettingImplication: 'Red card market worth considering',
      });
    }

    // Check for penalty tendency
    const penaltyMatches = last5.filter(m => m.penalties > 0).length;
    if (penaltyMatches >= 2) {
      foundStreaks.push({
        type: 'hot',
        description: `Penalty awarded in ${penaltyMatches} of last 5 matches`,
        matches: penaltyMatches,
        significance: penaltyMatches >= 3 ? 'high' : 'medium',
        bettingImplication: 'Penalty market worth considering',
      });
    }

    // Above/below average trend
    const aboveAvgMatches = last5.filter(m => m.totalCards > avgTotal).length;
    if (aboveAvgMatches >= 4) {
      foundStreaks.push({
        type: 'hot',
        description: `${aboveAvgMatches} of last 5 matches above season average`,
        matches: aboveAvgMatches,
        significance: 'medium',
        bettingImplication: 'Trending above average - consider overs',
      });
    } else if (aboveAvgMatches <= 1) {
      foundStreaks.push({
        type: 'cold',
        description: `${5 - aboveAvgMatches} of last 5 matches below season average`,
        matches: 5 - aboveAvgMatches,
        significance: 'medium',
        bettingImplication: 'Trending below average - consider unders',
      });
    }

    return foundStreaks;
  }, [recentMatches, avgTotal]);

  // Calculate trend direction
  const trendAnalysis = useMemo(() => {
    if (recentMatches.length < 5) return null;

    const last5Avg = recentMatches.slice(0, 5).reduce((sum, m) => sum + m.totalCards, 0) / 5;
    const prev5Avg = recentMatches.slice(5, 10).length >= 5
      ? recentMatches.slice(5, 10).reduce((sum, m) => sum + m.totalCards, 0) / 5
      : avgTotal;

    const change = last5Avg - prev5Avg;
    const percentChange = prev5Avg > 0 ? (change / prev5Avg) * 100 : 0;

    return {
      last5Avg,
      prev5Avg,
      change,
      percentChange,
      direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
    };
  }, [recentMatches, avgTotal]);

  // Count consecutive matches meeting condition
  function countConsecutive(matches: MatchData[], condition: (m: MatchData) => boolean): number {
    let count = 0;
    for (const match of matches) {
      if (condition(match)) count++;
      else break;
    }
    return count;
  }

  // Get streak badge color
  const getStreakColor = (streak: Streak) => {
    if (streak.type === 'hot') {
      return streak.significance === 'high'
        ? 'bg-red-500/20 border-red-500/50 text-red-400'
        : 'bg-orange-500/20 border-orange-500/50 text-orange-400';
    }
    return streak.significance === 'high'
      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
      : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
  };

  if (recentMatches.length < 3) {
    return (
      <div className="p-6 rounded-xl bg-secondary/20 text-center text-muted-foreground">
        Need at least 3 recent matches to analyze streaks
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      {trendAnalysis && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-2xl font-bold">
              {trendAnalysis.last5Avg.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Last 5 Avg</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className={`text-2xl font-bold ${
              trendAnalysis.direction === 'up' ? 'text-red-500' :
              trendAnalysis.direction === 'down' ? 'text-green-500' :
              'text-muted-foreground'
            }`}>
              {trendAnalysis.direction === 'up' && '+'}
              {trendAnalysis.change.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">vs Previous 5</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-2xl font-bold text-primary">
              {avgTotal.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Season Avg</div>
          </div>
        </div>
      )}

      {/* Trend Direction Indicator */}
      {trendAnalysis && (
        <div className={`p-4 rounded-xl ${
          trendAnalysis.direction === 'up' ? 'bg-red-500/10 border border-red-500/30' :
          trendAnalysis.direction === 'down' ? 'bg-blue-500/10 border border-blue-500/30' :
          'bg-secondary/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`text-3xl ${
              trendAnalysis.direction === 'up' ? 'text-red-500' :
              trendAnalysis.direction === 'down' ? 'text-blue-500' :
              'text-muted-foreground'
            }`}>
              {trendAnalysis.direction === 'up' ? '^' : trendAnalysis.direction === 'down' ? 'v' : '-'}
            </div>
            <div>
              <div className="font-bold">
                {trendAnalysis.direction === 'up' ? 'Trending Hot' :
                 trendAnalysis.direction === 'down' ? 'Trending Cold' :
                 'Stable Form'}
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.abs(trendAnalysis.percentChange).toFixed(0)}%
                {trendAnalysis.direction === 'up' ? ' increase' :
                 trendAnalysis.direction === 'down' ? ' decrease' :
                 ' change'} from previous 5 matches
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Streaks */}
      {streaks.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Active Streaks</h4>
          {streaks.map((streak, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${getStreakColor(streak)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      streak.type === 'hot' ? 'bg-red-500/30' : 'bg-blue-500/30'
                    }`}>
                      {streak.type}
                    </span>
                    <span className={`text-xs ${
                      streak.significance === 'high' ? 'text-yellow-400' : 'text-muted-foreground'
                    }`}>
                      {streak.significance === 'high' ? 'High Significance' : 'Moderate'}
                    </span>
                  </div>
                  <div className="font-medium mt-2">{streak.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold">{streak.matches}</div>
                  <div className="text-xs text-muted-foreground">matches</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-current/20 text-sm">
                <span className="text-muted-foreground">Betting Tip:</span>{' '}
                <span className="font-medium">{streak.bettingImplication}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-secondary/20 text-center">
          <div className="text-muted-foreground">No significant streaks detected</div>
          <div className="text-sm text-muted-foreground mt-1">
            Referee is showing consistent, average performance
          </div>
        </div>
      )}

      {/* Recent Matches Visual */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Last 5 Matches</h4>
        <div className="flex gap-2">
          {recentMatches.slice(0, 5).map((match, idx) => {
            const isHigh = match.totalCards >= 5;
            const isLow = match.totalCards < 3;
            return (
              <div
                key={idx}
                className={`flex-1 p-3 rounded-lg text-center ${
                  isHigh ? 'bg-red-500/20 border border-red-500/30' :
                  isLow ? 'bg-blue-500/20 border border-blue-500/30' :
                  'bg-secondary/30'
                }`}
              >
                <div className={`text-lg font-bold ${
                  isHigh ? 'text-red-400' :
                  isLow ? 'text-blue-400' :
                  ''
                }`}>
                  {match.totalCards}
                </div>
                <div className="text-xs text-muted-foreground truncate" title={`${match.homeTeam} vs ${match.awayTeam}`}>
                  {match.homeTeam.substring(0, 3).toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Most Recent</span>
          <span>Oldest</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/30"></div>
          <span>Hot (5+ cards)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/30"></div>
          <span>Cold (&lt;3 cards)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-secondary"></div>
          <span>Normal (3-4 cards)</span>
        </div>
      </div>
    </div>
  );
}
