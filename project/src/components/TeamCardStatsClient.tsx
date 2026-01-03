'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RefereeBreakdown {
  id: number;
  name: string;
  slug: string;
  matches: number;
  yellow: number;
  red: number;
  avgCards: number;
}

interface TeamCardData {
  id: number;
  name: string;
  logo: string | null;
  league: string;
  totalMatches: number;
  totalYellow: number;
  totalRed: number;
  avgYellowPerMatch: number;
  avgRedPerMatch: number;
  homeYellow: number;
  awayYellow: number;
  homeRed: number;
  awayRed: number;
  toughestReferee: RefereeBreakdown | null;
  easiestReferee: RefereeBreakdown | null;
  refereeBreakdown: RefereeBreakdown[];
}

interface TeamCardStatsClientProps {
  teams: TeamCardData[];

}

export default function TeamCardStatsClient({ teams }: TeamCardStatsClientProps) {
  const [sortBy, setSortBy] = useState<'avgYellow' | 'avgRed' | 'total' | 'matches'>('avgYellow');
  const [filterLeague, setFilterLeague] = useState<string>('all');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  const leagues = useMemo(() => {
    const uniqueLeagues = [...new Set(teams.map(t => t.league))];
    return uniqueLeagues.sort();
  }, [teams]);

  const sortedTeams = useMemo(() => {
    const filtered = filterLeague === 'all'
      ? teams
      : teams.filter(t => t.league === filterLeague);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'avgYellow':
          return b.avgYellowPerMatch - a.avgYellowPerMatch;
        case 'avgRed':
          return b.avgRedPerMatch - a.avgRedPerMatch;
        case 'total':
          return (b.totalYellow + b.totalRed) - (a.totalYellow + a.totalRed);
        case 'matches':
          return b.totalMatches - a.totalMatches;
        default:
          return 0;
      }
    });
  }, [teams, sortBy, filterLeague]);

  // Top stats
  const topStats = useMemo(() => {
    const sorted = [...teams].sort((a, b) => b.avgYellowPerMatch - a.avgYellowPerMatch);
    return {
      mostCarded: sorted.slice(0, 3),
      leastCarded: sorted.slice(-3).reverse(),
    };
  }, [teams]);

  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Most Disciplined Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStats.leastCarded.map((team, idx) => (
                <div key={team.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-green-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  {team.logo && (
                    <Image src={team.logo} alt={team.name} width={24} height={24} />
                  )}
                  <span className="flex-1">{team.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {team.avgYellowPerMatch.toFixed(2)} yellow/match
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Most Carded Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStats.mostCarded.map((team, idx) => (
                <div key={team.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-red-500 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  {team.logo && (
                    <Image src={team.logo} alt={team.name} width={24} height={24} />
                  )}
                  <span className="flex-1">{team.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {team.avgYellowPerMatch.toFixed(2)} yellow/match
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="avgYellow">Avg Yellow Cards</option>
            <option value="avgRed">Avg Red Cards</option>
            <option value="total">Total Cards</option>
            <option value="matches">Most Matches</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">League</label>
          <select
            value={filterLeague}
            onChange={(e) => setFilterLeague(e.target.value)}
            className="border rounded px-3 py-2 bg-background"
          >
            <option value="all">All Leagues</option>
            {leagues.map(league => (
              <option key={league} value={league}>{league}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Team List */}
      <div className="space-y-3">
        {sortedTeams.map((team) => (
          <Card key={team.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                {/* Logo */}
                <div className="w-12 h-12 relative shrink-0">
                  {team.logo ? (
                    <Image
                      src={team.logo}
                      alt={team.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                      <span className="text-xs">{team.name.slice(0, 2)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {team.league} &middot; {team.totalMatches} matches
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-500">
                      {team.avgYellowPerMatch.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Yellow/match</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-500">
                      {team.avgRedPerMatch.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Red/match</p>
                  </div>
                  <div className="text-muted-foreground">
                    {expandedTeam === team.id ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTeam === team.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Home vs Away */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 rounded p-3">
                      <p className="text-sm font-medium text-blue-500 mb-1">Home Matches</p>
                      <p className="text-lg">{team.homeYellow} yellow, {team.homeRed} red</p>
                    </div>
                    <div className="bg-orange-500/10 rounded p-3">
                      <p className="text-sm font-medium text-orange-500 mb-1">Away Matches</p>
                      <p className="text-lg">{team.awayYellow} yellow, {team.awayRed} red</p>
                    </div>
                  </div>

                  {/* Referee Breakdown */}
                  {team.refereeBreakdown.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Cards by Referee (Top 5)</p>
                      <div className="space-y-2">
                        {team.refereeBreakdown.map(ref => (
                          <Link
                            key={ref.id}
                            href={`/referees/${ref.slug}`}
                            className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors"
                          >
                            <span className="flex-1">{ref.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {ref.matches} matches
                            </span>
                            <span className="text-sm">
                              <span className="text-yellow-500">{ref.yellow}</span>
                              {' / '}
                              <span className="text-red-500">{ref.red}</span>
                            </span>
                            <span className="text-sm font-medium">
                              {ref.avgCards.toFixed(1)}/match
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toughest/Easiest Referee */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {team.toughestReferee && (
                      <Link
                        href={`/referees/${team.toughestReferee.slug}`}
                        className="bg-red-500/10 rounded p-3 hover:bg-red-500/20 transition-colors"
                      >
                        <p className="font-medium text-red-500">Toughest Referee</p>
                        <p>{team.toughestReferee.name}</p>
                        <p className="text-muted-foreground">
                          {team.toughestReferee.avgCards.toFixed(1)} cards/match
                        </p>
                      </Link>
                    )}
                    {team.easiestReferee && (
                      <Link
                        href={`/referees/${team.easiestReferee.slug}`}
                        className="bg-green-500/10 rounded p-3 hover:bg-green-500/20 transition-colors"
                      >
                        <p className="font-medium text-green-500">Easiest Referee</p>
                        <p>{team.easiestReferee.name}</p>
                        <p className="text-muted-foreground">
                          {team.easiestReferee.avgCards.toFixed(1)} cards/match
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
