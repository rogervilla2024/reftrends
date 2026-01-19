'use client';

import { useMemo } from 'react';
import { calculateExpectedCards } from '@/lib/predictions';

interface TeamData {
  name: string;
  logo?: string;
  avgYellowReceived: number;
  avgRedReceived: number;
  avgFoulsCommitted: number;
  matchesPlayed: number;
}

interface Props {
  refereeAvgYellow: number;
  refereeAvgRed: number;
  refereeMatches: number;
  strictnessIndex: number;
  homeTeam?: TeamData;
  awayTeam?: TeamData;
  matchDate?: string;
  competition?: string;
}

export default function UpcomingMatchPrediction({
  refereeAvgYellow,
  refereeAvgRed,
  refereeMatches,
  strictnessIndex,
  homeTeam,
  awayTeam,
  matchDate,
  competition,
}: Props) {
  const predictions = useMemo(() => {
    const refereeStats = {
      avgYellowCards: refereeAvgYellow,
      avgRedCards: refereeAvgRed,
      matchesOfficiated: refereeMatches,
      strictnessIndex,
    };

    const home = homeTeam ? {
      avgYellowReceived: homeTeam.avgYellowReceived,
      avgRedReceived: homeTeam.avgRedReceived,
      avgFoulsCommitted: homeTeam.avgFoulsCommitted,
      matchesPlayed: homeTeam.matchesPlayed,
    } : undefined;

    const away = awayTeam ? {
      avgYellowReceived: awayTeam.avgYellowReceived,
      avgRedReceived: awayTeam.avgRedReceived,
      avgFoulsCommitted: awayTeam.avgFoulsCommitted,
      matchesPlayed: awayTeam.matchesPlayed,
    } : undefined;

    return calculateExpectedCards(refereeStats, home, away);
  }, [refereeAvgYellow, refereeAvgRed, refereeMatches, strictnessIndex, homeTeam, awayTeam]);

  // Calculate confidence based on data availability
  const confidence = useMemo(() => {
    let score = 50; // Base confidence
    if (refereeMatches >= 20) score += 20;
    else if (refereeMatches >= 10) score += 10;
    if (homeTeam && homeTeam.matchesPlayed >= 10) score += 15;
    if (awayTeam && awayTeam.matchesPlayed >= 10) score += 15;
    return Math.min(score, 95);
  }, [refereeMatches, homeTeam, awayTeam]);

  // Risk level based on expected cards
  const riskLevel = useMemo(() => {
    const total = predictions.expectedTotalCards;
    if (total >= 5.5) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (total >= 4) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500/10' };
  }, [predictions]);

  // Generate betting tips
  const bettingTips = useMemo(() => {
    const tips: { tip: string; confidence: string; type: 'positive' | 'neutral' | 'negative' }[] = [];

    if (predictions.over35Probability > 65) {
      tips.push({ tip: 'Over 3.5 Cards', confidence: 'Strong', type: 'positive' });
    } else if (predictions.over35Probability > 55) {
      tips.push({ tip: 'Over 3.5 Cards', confidence: 'Moderate', type: 'neutral' });
    }

    if (predictions.under35Probability > 65) {
      tips.push({ tip: 'Under 3.5 Cards', confidence: 'Strong', type: 'positive' });
    } else if (predictions.under35Probability > 55) {
      tips.push({ tip: 'Under 3.5 Cards', confidence: 'Moderate', type: 'neutral' });
    }

    if (predictions.over45Probability > 60) {
      tips.push({ tip: 'Over 4.5 Cards', confidence: 'Consider', type: 'neutral' });
    }

    if (predictions.expectedRedCards > 0.3) {
      tips.push({ tip: 'Red Card Likely', confidence: 'Watch', type: 'negative' });
    }

    return tips;
  }, [predictions]);

  return (
    <div className="space-y-6">
      {/* Match Header */}
      {(homeTeam || awayTeam) && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
          <div className="flex items-center gap-3">
            {homeTeam?.logo && (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-10 h-10 object-contain" />
            )}
            <span className="font-bold">{homeTeam?.name || 'Home Team'}</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">{matchDate || 'TBD'}</div>
            <div className="font-bold text-lg">vs</div>
            {competition && (
              <div className="text-xs text-primary">{competition}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">{awayTeam?.name || 'Away Team'}</span>
            {awayTeam?.logo && (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-10 h-10 object-contain" />
            )}
          </div>
        </div>
      )}

      {/* Main Prediction Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Expected Total Cards */}
        <div className="col-span-2 p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-center">
          <div className="text-4xl font-bold text-primary">
            {predictions.expectedTotalCards.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Expected Total Cards</div>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full ${riskLevel.bg}`}>
            <span className={`text-sm font-medium ${riskLevel.color}`}>
              {riskLevel.level} Card Risk
            </span>
          </div>
        </div>

        {/* Yellow Cards */}
        <div className="p-4 rounded-xl bg-yellow-500/10 text-center">
          <div className="text-3xl font-bold text-yellow-500">
            {predictions.expectedYellowCards.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Yellow Cards</div>
        </div>

        {/* Red Cards */}
        <div className="p-4 rounded-xl bg-red-500/10 text-center">
          <div className="text-3xl font-bold text-red-500">
            {predictions.expectedRedCards.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Red Cards</div>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Card Probabilities</h4>

        {/* Over 2.5 */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Over 2.5 Cards</span>
            <span className="font-bold">{predictions.over25Probability.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${predictions.over25Probability}%` }}
            />
          </div>
        </div>

        {/* Over 3.5 */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Over 3.5 Cards</span>
            <span className="font-bold">{predictions.over35Probability.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${predictions.over35Probability}%` }}
            />
          </div>
        </div>

        {/* Over 4.5 */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Over 4.5 Cards</span>
            <span className="font-bold">{predictions.over45Probability.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
              style={{ width: `${predictions.over45Probability}%` }}
            />
          </div>
        </div>

        {/* Under 3.5 */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Under 3.5 Cards</span>
            <span className="font-bold">{predictions.under35Probability.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${predictions.under35Probability}%` }}
            />
          </div>
        </div>
      </div>

      {/* Betting Tips */}
      {bettingTips.length > 0 && (
        <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
          <h4 className="font-medium text-sm">Betting Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {bettingTips.map((tip, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg text-sm ${
                  tip.type === 'positive' ? 'bg-green-500/20 text-green-400' :
                  tip.type === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                <span className="font-medium">{tip.tip}</span>
                <span className="text-xs ml-2 opacity-75">({tip.confidence})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Meter */}
      <div className="p-4 rounded-xl bg-secondary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Prediction Confidence</span>
          <span className="font-bold text-primary">{confidence}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Based on {refereeMatches} referee matches
          {homeTeam && `, ${homeTeam.matchesPlayed} home team matches`}
          {awayTeam && `, ${awayTeam.matchesPlayed} away team matches`}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80">
        <strong>Disclaimer:</strong> These predictions are based on historical statistics and should be used for informational purposes only.
        Past performance does not guarantee future results. Please gamble responsibly.
      </div>
    </div>
  );
}
