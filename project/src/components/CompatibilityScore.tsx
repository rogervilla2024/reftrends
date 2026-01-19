'use client';

import { useMemo } from 'react';
import { calculateCompatibilityScore } from '@/lib/predictions';

interface HistoricalMatch {
  date: Date;
  yellowCards: number;
  redCards: number;
  fouls: number;
  teamGoals: number;
  opponentGoals: number;
  opponentName: string;
}

interface Props {
  teamName: string;
  teamLogo?: string | null;
  refereeName: string;
  refereePhoto?: string | null;
  historicalMatches: HistoricalMatch[];
  refereeSeasonAvgYellow: number;
  teamSeasonAvgYellow: number;
}

export default function CompatibilityScore({
  teamName,
  teamLogo,
  refereeName,
  refereePhoto,
  historicalMatches,
  refereeSeasonAvgYellow,
  teamSeasonAvgYellow,
}: Props) {
  const compatibility = useMemo(() => {
    const matchData = historicalMatches.map(m => ({
      yellowCards: m.yellowCards,
      redCards: m.redCards,
      fouls: m.fouls,
      result: m.teamGoals > m.opponentGoals ? 'win' as const :
              m.teamGoals < m.opponentGoals ? 'loss' as const : 'draw' as const,
    }));

    return calculateCompatibilityScore(
      matchData,
      refereeSeasonAvgYellow,
      teamSeasonAvgYellow
    );
  }, [historicalMatches, refereeSeasonAvgYellow, teamSeasonAvgYellow]);

  const getRatingColor = () => {
    switch (compatibility.rating) {
      case 'excellent': return { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' };
      case 'good': return { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500' };
      case 'neutral': return { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500' };
      case 'poor': return { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' };
      case 'very_poor': return { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' };
    }
  };

  const getRatingLabel = () => {
    switch (compatibility.rating) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'neutral': return 'Neutral';
      case 'poor': return 'Poor';
      case 'very_poor': return 'Very Poor';
    }
  };

  const getCardTendencyInfo = () => {
    switch (compatibility.cardTendency) {
      case 'fewer': return { icon: 'v', text: 'Fewer Cards', color: 'text-green-500' };
      case 'more': return { icon: '^', text: 'More Cards', color: 'text-red-500' };
      default: return { icon: '-', text: 'Normal', color: 'text-yellow-500' };
    }
  };

  const colors = getRatingColor();
  const tendencyInfo = getCardTendencyInfo();

  // Calculate match stats
  const stats = useMemo(() => {
    if (historicalMatches.length === 0) return null;

    const wins = historicalMatches.filter(m => m.teamGoals > m.opponentGoals).length;
    const draws = historicalMatches.filter(m => m.teamGoals === m.opponentGoals).length;
    const losses = historicalMatches.filter(m => m.teamGoals < m.opponentGoals).length;
    const totalYellow = historicalMatches.reduce((sum, m) => sum + m.yellowCards, 0);
    const totalRed = historicalMatches.reduce((sum, m) => sum + m.redCards, 0);

    return {
      wins,
      draws,
      losses,
      winRate: (wins / historicalMatches.length * 100).toFixed(0),
      totalYellow,
      totalRed,
      avgYellow: (totalYellow / historicalMatches.length).toFixed(1),
      avgRed: (totalRed / historicalMatches.length).toFixed(2),
    };
  }, [historicalMatches]);

  if (historicalMatches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg mb-2">No Historical Data</p>
        <p className="text-sm">No previous matches between {teamName} and {refereeName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Team */}
          <div className="flex items-center gap-2">
            {teamLogo ? (
              <img src={teamLogo} alt={teamName} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                {teamName.charAt(0)}
              </div>
            )}
            <span className="font-bold">{teamName}</span>
          </div>

          <span className="text-2xl text-muted-foreground">vs</span>

          {/* Referee */}
          <div className="flex items-center gap-2">
            {refereePhoto ? (
              <img src={refereePhoto} alt={refereeName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm text-muted-foreground">
                REF
              </div>
            )}
            <span className="font-bold">{refereeName}</span>
          </div>
        </div>

        {/* Score Circle */}
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ring-4 ${colors.ring} bg-background`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${colors.text}`}>{compatibility.score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        </div>
      </div>

      {/* Rating and Tendency */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl ${colors.bg}/10 text-center`}>
          <div className={`text-xl font-bold ${colors.text}`}>{getRatingLabel()}</div>
          <p className="text-xs text-muted-foreground mt-1">Compatibility Rating</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <div className={`text-xl font-bold flex items-center justify-center gap-1 ${tendencyInfo.color}`}>
            <span>{tendencyInfo.icon}</span>
            <span>{tendencyInfo.text}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Card Tendency</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/30 text-center">
          <div className="text-xl font-bold text-primary">{compatibility.historicalMatches}</div>
          <p className="text-xs text-muted-foreground mt-1">Matches Together</p>
        </div>
      </div>

      {/* Detailed Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-green-500">{stats.winRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.wins}W - {stats.draws}D - {stats.losses}L
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-sm text-muted-foreground mb-1">Avg Cards</div>
            <div className="text-2xl font-bold">{compatibility.avgCardsInHistory}</div>
            <div className="text-xs text-muted-foreground mt-1">per match</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-sm text-muted-foreground mb-1">Yellow Cards</div>
            <div className="text-2xl font-bold text-yellow-500">{stats.totalYellow}</div>
            <div className="text-xs text-muted-foreground mt-1">{stats.avgYellow} avg</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border text-center">
            <div className="text-sm text-muted-foreground mb-1">Red Cards</div>
            <div className="text-2xl font-bold text-red-500">{stats.totalRed}</div>
            <div className="text-xs text-muted-foreground mt-1">{stats.avgRed} avg</div>
          </div>
        </div>
      )}

      {/* Historical Matches List */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Match History</h4>
        <div className="space-y-2">
          {historicalMatches.slice(0, 5).map((match, idx) => {
            const result = match.teamGoals > match.opponentGoals ? 'W' :
                          match.teamGoals < match.opponentGoals ? 'L' : 'D';
            const resultColor = result === 'W' ? 'bg-green-500' :
                               result === 'L' ? 'bg-red-500' : 'bg-yellow-500';

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${resultColor} flex items-center justify-center text-white font-bold text-sm`}>
                    {result}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {teamName} {match.teamGoals} - {match.opponentGoals} {match.opponentName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(match.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-xs font-medium">Y</span>
                    <span className="font-bold">{match.yellowCards}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-red-500 text-xs font-medium">R</span>
                    <span className="font-bold">{match.redCards}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Box */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h4 className="font-bold mb-2">Betting Insight</h4>
        <p className="text-sm text-muted-foreground">
          {compatibility.rating === 'excellent' || compatibility.rating === 'good' ? (
            <>
              {teamName} typically performs well with {refereeName} officiating.
              {compatibility.cardTendency === 'fewer' && ' They also receive fewer cards than average in these matches.'}
              Consider this a favorable matchup.
            </>
          ) : compatibility.rating === 'poor' || compatibility.rating === 'very_poor' ? (
            <>
              {teamName} has historically struggled with {refereeName} as referee.
              {compatibility.cardTendency === 'more' && ' They tend to receive more cards than usual.'}
              This could be a challenging matchup.
            </>
          ) : (
            <>
              The historical data shows a neutral relationship between {teamName} and {refereeName}.
              No significant advantage or disadvantage detected.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Compact version for cards/lists
export function CompatibilityBadge({
  score,
  rating,
}: {
  score: number;
  rating: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
}) {
  const getColor = () => {
    switch (rating) {
      case 'excellent': return 'bg-green-500/20 text-green-500';
      case 'good': return 'bg-emerald-500/20 text-emerald-500';
      case 'neutral': return 'bg-yellow-500/20 text-yellow-500';
      case 'poor': return 'bg-orange-500/20 text-orange-500';
      case 'very_poor': return 'bg-red-500/20 text-red-500';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getColor()}`}>
      {score}
    </span>
  );
}
