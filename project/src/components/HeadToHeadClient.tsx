'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Team {
  id: number;
  apiId: number;
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

interface MatchDetail {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  isHome: boolean;
  teamYellow: number;
  teamRed: number;
  result: 'W' | 'D' | 'L';
  league: string;
}

interface H2HStats {
  matchCount: number;
  totalYellow: number;
  totalRed: number;
  avgYellow: number;
  avgRed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
}

interface Comparison {
  avgYellowWithRef: number;
  avgYellowOverall: number;
  difference: number;
  percentDiff: number;
}

interface H2HData {
  team: { id: number; name: string; logo: string | null; league: string };
  referee: { id: number; name: string; slug: string; photo: string | null };
  matches: MatchDetail[];
  stats: H2HStats | null;
  comparison: Comparison | null;
}

interface HeadToHeadClientProps {
  teams: Team[];
  referees: Referee[];
}

export default function HeadToHeadClient({ teams, referees }: HeadToHeadClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedReferee, setSelectedReferee] = useState<number | null>(null);
  const [data, setData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamSearch, setTeamSearch] = useState('');
  const [refereeSearch, setRefereeSearch] = useState('');

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredReferees = referees.filter(r =>
    r.name.toLowerCase().includes(refereeSearch.toLowerCase())
  );

  useEffect(() => {
    async function fetchData() {
      if (!selectedTeam || !selectedReferee) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/head-to-head?teamId=${selectedTeam}&refereeId=${selectedReferee}`
        );

        if (!response.ok) throw new Error('Failed to fetch data');

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load head-to-head data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTeam, selectedReferee]);

  const getResultColor = (result: string) => {
    if (result === 'W') return 'text-green-500';
    if (result === 'L') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-8">
      {/* Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Team</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Search teams..."
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3 bg-background"
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredTeams.slice(0, 50).map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded text-left hover:bg-secondary/50 transition-colors ${
                    selectedTeam === team.id ? 'bg-primary/10 border-primary border' : ''
                  }`}
                >
                  {team.logo && (
                    <Image src={team.logo} alt={team.name} width={24} height={24} />
                  )}
                  <span className="flex-1">{team.name}</span>
                  <span className="text-xs text-muted-foreground">{team.league}</span>
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
            <input
              type="text"
              placeholder="Search referees..."
              value={refereeSearch}
              onChange={(e) => setRefereeSearch(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3 bg-background"
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredReferees.slice(0, 50).map(referee => (
                <button
                  key={referee.id}
                  onClick={() => setSelectedReferee(referee.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded text-left hover:bg-secondary/50 transition-colors ${
                    selectedReferee === referee.id ? 'bg-primary/10 border-primary border' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative shrink-0">
                    {referee.photo ? (
                      <Image src={referee.photo} alt={referee.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {referee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span>{referee.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading data...</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="bg-red-500/10">
          <CardContent className="py-6 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {data.matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No matches found between {data.team.name} and {data.referee.name}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header */}
              <Card className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      {data.team.logo && (
                        <Image
                          src={data.team.logo}
                          alt={data.team.name}
                          width={64}
                          height={64}
                          className="mx-auto mb-2"
                        />
                      )}
                      <h2 className="font-bold text-lg">{data.team.name}</h2>
                      <p className="text-sm text-muted-foreground">{data.team.league}</p>
                    </div>

                    <div className="text-4xl font-bold text-muted-foreground">vs</div>

                    <Link href={`/referees/${data.referee.slug}`} className="text-center hover:opacity-80">
                      <div className="w-16 h-16 rounded-full bg-secondary overflow-hidden relative mx-auto mb-2">
                        {data.referee.photo ? (
                          <Image src={data.referee.photo} alt={data.referee.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {data.referee.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h2 className="font-bold text-lg">{data.referee.name}</h2>
                      <p className="text-sm text-muted-foreground">Referee</p>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              {data.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold">{data.stats.matchCount}</div>
                      <p className="text-sm text-muted-foreground">Matches</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-500">
                        {data.stats.wins}-{data.stats.draws}-{data.stats.losses}
                      </div>
                      <p className="text-sm text-muted-foreground">W-D-L Record</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-yellow-500">{data.stats.avgYellow.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Avg Yellow/Match</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold">{data.stats.winRate.toFixed(0)}%</div>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Comparison */}
              {data.comparison && (
                <Card className={data.comparison.difference > 0 ? 'bg-red-500/5' : 'bg-green-500/5'}>
                  <CardContent className="py-6">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">With This Referee</p>
                        <p className="text-2xl font-bold">{data.comparison.avgYellowWithRef.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Difference</p>
                        <p className={`text-2xl font-bold ${data.comparison.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {data.comparison.difference > 0 ? '+' : ''}{data.comparison.difference.toFixed(2)}
                          <span className="text-sm ml-1">
                            ({data.comparison.percentDiff > 0 ? '+' : ''}{data.comparison.percentDiff.toFixed(0)}%)
                          </span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
                        <p className="text-2xl font-bold">{data.comparison.avgYellowOverall.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      {data.team.name} receives{' '}
                      <strong>
                        {Math.abs(data.comparison.percentDiff).toFixed(0)}%{' '}
                        {data.comparison.difference > 0 ? 'more' : 'fewer'}
                      </strong>{' '}
                      yellow cards with {data.referee.name} compared to their overall average.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Match History */}
              <Card>
                <CardHeader>
                  <CardTitle>Match History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <span className="text-sm text-muted-foreground w-24">{match.date}</span>
                        <div className="flex-1">
                          <p className="font-medium">
                            {match.homeTeam} {match.homeGoals} - {match.awayGoals} {match.awayTeam}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {match.isHome ? 'Home' : 'Away'} &middot; {match.league}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-yellow-500">{match.teamYellow} yellow</span>
                          {match.teamRed > 0 && (
                            <span className="text-red-500">{match.teamRed} red</span>
                          )}
                          <span className={`font-bold text-lg ${getResultColor(match.result)}`}>
                            {match.result}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Instructions */}
      {!selectedTeam || !selectedReferee ? (
        <Card className="bg-muted/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Select a team and a referee to see their head-to-head statistics
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
