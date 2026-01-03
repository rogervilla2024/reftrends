'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RefereeFormIndicator, { FormLegend } from '@/components/RefereeFormIndicator';

interface MatchForm {
  yellowCards: number;
  redCards: number;
  date: string;
  teams: string;
}

interface RefereeWithStats {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  league: string;
  matchesOfficiated: number;
  totalYellowCards: number;
  totalRedCards: number;
  avgYellowCards: number;
  avgRedCards: number;
  strictnessIndex: number;
  recentForm: MatchForm[];
}

interface TopRefereesData {
  mostCards: RefereeWithStats[];
  strictest: RefereeWithStats[];
  mostMatches: RefereeWithStats[];
}

export default function TopRefereesStats() {
  const [data, setData] = useState<TopRefereesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopReferees() {
      try {
        const response = await fetch('/api/referees/top-stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch top referees:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopReferees();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const categories = [
    {
      title: '🟨 Most Cards Shown',
      subtitle: 'Total Yellow + Red Cards',
      referees: data.mostCards,
      statLabel: 'Cards',
      getStat: (r: RefereeWithStats) => r.totalYellowCards + r.totalRedCards,
      getSubStat: (r: RefereeWithStats) => `${r.totalYellowCards}🟨 ${r.totalRedCards}🟥`,
    },
    {
      title: '⚡ Strictest Referees',
      subtitle: 'Strictness Index',
      referees: data.strictest,
      statLabel: 'Index',
      getStat: (r: RefereeWithStats) => r.strictnessIndex.toFixed(1),
      getSubStat: (r: RefereeWithStats) => `${r.avgYellowCards.toFixed(1)} yellow/match`,
    },
    {
      title: '🏟️ Most Experienced',
      subtitle: 'Matches This Season',
      referees: data.mostMatches,
      statLabel: 'Matches',
      getStat: (r: RefereeWithStats) => r.matchesOfficiated,
      getSubStat: (r: RefereeWithStats) => r.league,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Referee Statistics</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-4">
          2025 season referee performance data
        </p>
        <div className="flex justify-center">
          <FormLegend />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.title} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                {category.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{category.subtitle}</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {category.referees.slice(0, 5).map((referee, index) => (
                  <Link
                    key={referee.id}
                    href={`/referees/${referee.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    {/* Rank */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Photo */}
                    <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden relative shrink-0">
                      {referee.photo ? (
                        <Image
                          src={referee.photo}
                          alt={referee.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Name & Sub stat */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {referee.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {category.getSubStat(referee)}
                      </p>
                      {referee.recentForm && referee.recentForm.length > 0 && (
                        <div className="mt-1">
                          <RefereeFormIndicator matches={referee.recentForm} size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Main stat */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg text-primary">
                        {category.getStat(referee)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.statLabel}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
