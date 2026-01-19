'use client';

import { useMemo, useState } from 'react';

interface TeamHistoryData {
  teamName: string;
  teamLogo?: string;
  matchesWithReferee: number;
  totalYellowCards: number;
  totalRedCards: number;
  totalPenaltiesFor: number;
  totalPenaltiesAgainst: number;
  wins: number;
  draws: number;
  losses: number;
}

interface Props {
  teamHistory: TeamHistoryData[];
  refereeAvgYellow: number;
  refereeAvgRed: number;
  refereeAvgPenalties: number;
}

export default function TeamCardProbabilities({
  teamHistory,
  refereeAvgYellow,
  refereeAvgRed,
  refereeAvgPenalties,
}: Props) {
  const [selectedTeam, setSelectedTeam] = useState<TeamHistoryData | null>(
    teamHistory.length > 0 ? teamHistory[0] : null
  );
  const [sortBy, setSortBy] = useState<'matches' | 'cards' | 'penalties'>('matches');

  // Sort teams
  const sortedTeams = useMemo(() => {
    return [...teamHistory].sort((a, b) => {
      if (sortBy === 'matches') return b.matchesWithReferee - a.matchesWithReferee;
      if (sortBy === 'cards') {
        const aAvg = a.matchesWithReferee > 0 ? (a.totalYellowCards + a.totalRedCards * 2) / a.matchesWithReferee : 0;
        const bAvg = b.matchesWithReferee > 0 ? (b.totalYellowCards + b.totalRedCards * 2) / b.matchesWithReferee : 0;
        return bAvg - aAvg;
      }
      if (sortBy === 'penalties') {
        const aAvg = a.matchesWithReferee > 0 ? (a.totalPenaltiesFor + a.totalPenaltiesAgainst) / a.matchesWithReferee : 0;
        const bAvg = b.matchesWithReferee > 0 ? (b.totalPenaltiesFor + b.totalPenaltiesAgainst) / b.matchesWithReferee : 0;
        return bAvg - aAvg;
      }
      return 0;
    });
  }, [teamHistory, sortBy]);

  // Calculate team-specific stats
  const getTeamStats = (team: TeamHistoryData) => {
    if (team.matchesWithReferee === 0) {
      return {
        avgYellow: 0,
        avgRed: 0,
        avgTotal: 0,
        avgPenaltiesFor: 0,
        avgPenaltiesAgainst: 0,
        winRate: 0,
        yellowDiff: 0,
        penaltyDiff: 0,
      };
    }

    const avgYellow = team.totalYellowCards / team.matchesWithReferee;
    const avgRed = team.totalRedCards / team.matchesWithReferee;
    const avgTotal = avgYellow + avgRed;
    const avgPenaltiesFor = team.totalPenaltiesFor / team.matchesWithReferee;
    const avgPenaltiesAgainst = team.totalPenaltiesAgainst / team.matchesWithReferee;
    const winRate = (team.wins / team.matchesWithReferee) * 100;

    // Compare to referee average
    const yellowDiff = avgYellow - refereeAvgYellow / 2; // per team, so divide by 2
    const penaltyDiff = (avgPenaltiesFor + avgPenaltiesAgainst) - refereeAvgPenalties;

    return {
      avgYellow,
      avgRed,
      avgTotal,
      avgPenaltiesFor,
      avgPenaltiesAgainst,
      winRate,
      yellowDiff,
      penaltyDiff,
    };
  };

  // Calculate over/under probabilities using simplified Poisson
  const calculateProbabilities = (expectedCards: number) => {
    // Simplified Poisson calculation
    const poisson = (k: number, lambda: number) => {
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    };

    const factorial = (n: number): number => {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    };

    // Calculate cumulative probabilities
    let under25 = 0;
    let under35 = 0;
    let under45 = 0;

    for (let k = 0; k <= 20; k++) {
      const prob = poisson(k, expectedCards);
      if (k <= 2) under25 += prob;
      if (k <= 3) under35 += prob;
      if (k <= 4) under45 += prob;
    }

    return {
      over25: (1 - under25) * 100,
      over35: (1 - under35) * 100,
      over45: (1 - under45) * 100,
      under25: under25 * 100,
      under35: under35 * 100,
      under45: under45 * 100,
    };
  };

  const selectedStats = selectedTeam ? getTeamStats(selectedTeam) : null;
  const selectedProbs = selectedStats ? calculateProbabilities(selectedStats.avgTotal * 2) : null;

  if (teamHistory.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-secondary/20 text-center text-muted-foreground">
        No team history data available for this referee
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-muted-foreground">Select Team</h4>
          <div className="flex gap-1">
            <button
              onClick={() => setSortBy('matches')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'matches' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setSortBy('cards')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setSortBy('penalties')}
              className={`px-2 py-1 text-xs rounded ${
                sortBy === 'penalties' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
              }`}
            >
              Penalties
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {sortedTeams.map((team) => {
            const stats = getTeamStats(team);
            return (
              <button
                key={team.teamName}
                onClick={() => setSelectedTeam(team)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedTeam?.teamName === team.teamName
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {team.teamLogo && (
                    <img src={team.teamLogo} alt={team.teamName} className="w-6 h-6 object-contain" />
                  )}
                  <span className="font-medium text-sm truncate">{team.teamName}</span>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{team.matchesWithReferee} matches</span>
                  <span className="text-yellow-500">{stats.avgYellow.toFixed(1)} Y</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Team Analysis */}
      {selectedTeam && selectedStats && selectedProbs && (
        <>
          {/* Team Header */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5">
            <div className="flex items-center gap-3">
              {selectedTeam.teamLogo && (
                <img
                  src={selectedTeam.teamLogo}
                  alt={selectedTeam.teamName}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <div className="font-bold text-lg">{selectedTeam.teamName}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedTeam.matchesWithReferee} matches with this referee
                </div>
              </div>
            </div>
          </div>

          {/* Card Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-center">
              <div className="text-xl font-bold text-yellow-500">
                {selectedStats.avgYellow.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Yellow</div>
              <div className={`text-xs mt-1 ${
                selectedStats.yellowDiff > 0.2 ? 'text-red-400' :
                selectedStats.yellowDiff < -0.2 ? 'text-green-400' :
                'text-muted-foreground'
              }`}>
                {selectedStats.yellowDiff > 0 ? '+' : ''}{selectedStats.yellowDiff.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-center">
              <div className="text-xl font-bold text-red-500">
                {selectedStats.avgRed.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Red</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-center">
              <div className="text-xl font-bold text-blue-500">
                {selectedStats.avgPenaltiesFor.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Pen For</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-center">
              <div className="text-xl font-bold text-purple-500">
                {selectedStats.avgPenaltiesAgainst.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Pen Against</div>
            </div>
          </div>

          {/* Win/Draw/Loss */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="text-sm text-muted-foreground mb-3">Record with this Referee</div>
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded-lg bg-green-500/20 text-center">
                <div className="text-lg font-bold text-green-500">{selectedTeam.wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-gray-500/20 text-center">
                <div className="text-lg font-bold">{selectedTeam.draws}</div>
                <div className="text-xs text-muted-foreground">Draws</div>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-red-500/20 text-center">
                <div className="text-lg font-bold text-red-500">{selectedTeam.losses}</div>
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden flex">
              <div
                className="bg-green-500"
                style={{ width: `${selectedStats.winRate}%` }}
              />
              <div
                className="bg-gray-500"
                style={{ width: `${(selectedTeam.draws / selectedTeam.matchesWithReferee) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(selectedTeam.losses / selectedTeam.matchesWithReferee) * 100}%` }}
              />
            </div>
          </div>

          {/* Card Probabilities */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-4">
            <div className="text-sm text-muted-foreground">
              Predicted Card Probabilities for {selectedTeam.teamName} matches
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Over Markets */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">OVER</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Over 2.5</span>
                    <span className={`font-bold ${selectedProbs.over25 > 60 ? 'text-green-400' : ''}`}>
                      {selectedProbs.over25.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Over 3.5</span>
                    <span className={`font-bold ${selectedProbs.over35 > 55 ? 'text-green-400' : ''}`}>
                      {selectedProbs.over35.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Over 4.5</span>
                    <span className={`font-bold ${selectedProbs.over45 > 50 ? 'text-green-400' : ''}`}>
                      {selectedProbs.over45.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Under Markets */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">UNDER</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Under 2.5</span>
                    <span className={`font-bold ${selectedProbs.under25 > 40 ? 'text-blue-400' : ''}`}>
                      {selectedProbs.under25.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Under 3.5</span>
                    <span className={`font-bold ${selectedProbs.under35 > 50 ? 'text-blue-400' : ''}`}>
                      {selectedProbs.under35.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-secondary/50">
                    <span className="text-sm">Under 4.5</span>
                    <span className={`font-bold ${selectedProbs.under45 > 55 ? 'text-blue-400' : ''}`}>
                      {selectedProbs.under45.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Insight */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="font-medium mb-2">Betting Insight</div>
            <div className="text-sm text-muted-foreground">
              {selectedStats.yellowDiff > 0.3 ? (
                <>
                  {selectedTeam.teamName} tends to receive <span className="text-yellow-400 font-medium">more cards</span> than
                  average when this referee officiates. Consider <span className="text-green-400 font-medium">OVER</span> markets.
                </>
              ) : selectedStats.yellowDiff < -0.3 ? (
                <>
                  {selectedTeam.teamName} tends to receive <span className="text-blue-400 font-medium">fewer cards</span> than
                  average when this referee officiates. Consider <span className="text-blue-400 font-medium">UNDER</span> markets.
                </>
              ) : (
                <>
                  {selectedTeam.teamName} shows <span className="font-medium">typical card rates</span> with this referee.
                  No significant bias detected - rely on match context.
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80">
        <strong>Note:</strong> Probabilities are based on historical data between this referee and team.
        Small sample sizes may lead to less reliable predictions.
      </div>
    </div>
  );
}
