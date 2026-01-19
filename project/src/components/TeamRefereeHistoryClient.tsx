'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Team {
  id: number;
  name: string;
  logo: string | null;
  league: string;
}

interface Referee {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
}

interface HistoryRecord {
  teamId: number;
  teamName: string;
  refereeId: number;
  refereeName: string;
  refereeSlug: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  yellowCards: number;
  redCards: number;
  goalsFor: number;
  goalsAgainst: number;
  recentMatches: Array<{
    date: string;
    opponent: string;
    result: string;
    yellowCards: number;
    redCards: number;
    league: string;
  }>;
}

interface Props {
  teams: Team[];
  referees: Referee[];
  history: HistoryRecord[];
}

export default function TeamRefereeHistoryClient({ teams, referees, history }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedReferee, setSelectedReferee] = useState<number | null>(null);
  const [teamSearch, setTeamSearch] = useState('');
  const [refereeSearch, setRefereeSearch] = useState('');

  const filteredTeams = useMemo(() => {
    return teams.filter(t =>
      t.name.toLowerCase().includes(teamSearch.toLowerCase())
    );
  }, [teams, teamSearch]);

  const filteredReferees = useMemo(() => {
    return referees.filter(r =>
      r.name.toLowerCase().includes(refereeSearch.toLowerCase())
    );
  }, [referees, refereeSearch]);

  const selectedHistory = useMemo(() => {
    if (selectedTeam && selectedReferee) {
      return history.find(h => h.teamId === selectedTeam && h.refereeId === selectedReferee);
    }
    if (selectedTeam) {
      return history.filter(h => h.teamId === selectedTeam).sort((a, b) => b.matches - a.matches);
    }
    if (selectedReferee) {
      return history.filter(h => h.refereeId === selectedReferee).sort((a, b) => b.matches - a.matches);
    }
    return null;
  }, [history, selectedTeam, selectedReferee]);

  const selectedTeamData = teams.find(t => t.id === selectedTeam);
  const selectedRefereeData = referees.find(r => r.id === selectedReferee);

  return (
    <div className="space-y-6">
      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search teams..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredTeams.slice(0, 20).map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id === selectedTeam ? null : team.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                    selectedTeam === team.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  {team.logo && (
                    <Image src={team.logo} alt={team.name} width={24} height={24} className="w-6 h-6" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{team.name}</p>
                    <p className={`text-xs ${selectedTeam === team.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {team.league}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Referee</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search referees..."
              value={refereeSearch}
              onChange={(e) => setRefereeSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredReferees.slice(0, 20).map((referee) => (
                <button
                  key={referee.id}
                  onClick={() => setSelectedReferee(referee.id === selectedReferee ? null : referee.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                    selectedReferee === referee.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {referee.photo ? (
                      <Image src={referee.photo} alt={referee.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">REF</div>
                    )}
                  </div>
                  <p className="font-medium text-sm">{referee.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {selectedTeam && selectedReferee && selectedHistory && !Array.isArray(selectedHistory) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <span>{selectedTeamData?.name}</span>
              <span className="text-muted-foreground">vs</span>
              <Link href={`/referees/${selectedRefereeData?.slug}`} className="text-primary hover:underline">
                {selectedRefereeData?.name}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold">{selectedHistory.matches}</p>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold text-green-500">{selectedHistory.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold text-yellow-500">{selectedHistory.yellowCards}</p>
                <p className="text-sm text-muted-foreground">Yellow Cards</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-3xl font-bold text-red-500">{selectedHistory.redCards}</p>
                <p className="text-sm text-muted-foreground">Red Cards</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <p className="text-2xl font-bold">{selectedHistory.wins}</p>
                <p className="text-xs text-muted-foreground">W</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{selectedHistory.draws}</p>
                <p className="text-xs text-muted-foreground">D</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{selectedHistory.losses}</p>
                <p className="text-xs text-muted-foreground">L</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Yellow Cards/Match</span>
                <span className="font-medium">{(selectedHistory.yellowCards / selectedHistory.matches).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium">{((selectedHistory.wins / selectedHistory.matches) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goals For/Against</span>
                <span className="font-medium">{selectedHistory.goalsFor} / {selectedHistory.goalsAgainst}</span>
              </div>
            </div>

            {/* Recent Matches */}
            {selectedHistory.recentMatches.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recent Matches</h4>
                <div className="space-y-2">
                  {selectedHistory.recentMatches.map((match, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">{match.date} • {match.league}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{match.result}</p>
                        <p className="text-xs">
                          <span className="text-yellow-500">{match.yellowCards}Y</span>
                          {match.redCards > 0 && <span className="text-red-500 ml-1">{match.redCards}R</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team History List */}
      {selectedTeam && !selectedReferee && Array.isArray(selectedHistory) && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTeamData?.name} - Referee History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedHistory.slice(0, 10).map((record) => (
                <div key={record.refereeId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Link href={`/referees/${record.refereeSlug}`} className="font-medium hover:text-primary">
                      {record.refereeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{record.matches} matches</span>
                    <span className="text-yellow-500">{record.yellowCards}Y</span>
                    <span className="text-green-500">{record.wins}W</span>
                    <Button size="sm" variant="outline" onClick={() => setSelectedReferee(record.refereeId)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referee History List */}
      {!selectedTeam && selectedReferee && Array.isArray(selectedHistory) && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedRefereeData?.name} - Team History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedHistory.slice(0, 10).map((record) => (
                <div key={record.teamId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="font-medium">{record.teamName}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{record.matches} matches</span>
                    <span className="text-yellow-500">{record.yellowCards}Y</span>
                    <span className="text-green-500">{record.wins}W</span>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTeam(record.teamId)}>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedTeam && !selectedReferee && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4 font-bold text-muted-foreground">?</div>
            <h3 className="text-xl font-bold mb-2">Select a Team or Referee</h3>
            <p className="text-muted-foreground">
              Choose a team and/or referee above to see their historical statistics together
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
