import { Metadata } from 'next';
import Link from 'next/link';
import SureCardsClient from '@/components/SureCardsClient';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Sure Cards Finder | RefTrends',
  description: 'Find high-probability card betting opportunities. Analyze referee-team combinations with the highest historical card rates.',
  openGraph: {
    title: 'Sure Cards Finder - RefTrends',
    description: 'Find high-probability card betting opportunities based on historical data.',
    url: 'https://reftrends.com/tools/sure-cards',
  },
  alternates: {
    canonical: 'https://reftrends.com/tools/sure-cards',
  },
};

interface RefereeTeamCombo {
  refereeId: number;
  refereeName: string;
  refereeSlug: string;
  refereePhoto: string | null;
  teamId: number;
  teamName: string;
  teamLogo: string | null;
  leagueName: string;
  matchCount: number;
  totalYellowCards: number;
  totalRedCards: number;
  avgYellowCards: number;
  avgRedCards: number;
  over25Rate: number;
  over35Rate: number;
  over45Rate: number;
}

async function getRefereeTeamCombos(): Promise<RefereeTeamCombo[]> {
  const matches = await prisma.match.findMany({
    where: {
      refereeId: { not: null },
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      referee: true,
      homeTeam: { include: { league: true } },
      awayTeam: { include: { league: true } },
      stats: true,
    },
  });

  const combos: Record<string, {
    refereeId: number;
    refereeName: string;
    refereeSlug: string;
    refereePhoto: string | null;
    teamId: number;
    teamName: string;
    teamLogo: string | null;
    leagueName: string;
    matches: number;
    yellowCards: number;
    redCards: number;
    over25Count: number;
    over35Count: number;
    over45Count: number;
  }> = {};

  for (const match of matches) {
    if (!match.referee || !match.stats) continue;

    const totalCards = match.stats.yellowCards + match.stats.redCards;

    // Home team combo
    const homeKey = `${match.refereeId}-${match.homeTeamId}`;
    if (!combos[homeKey]) {
      combos[homeKey] = {
        refereeId: match.referee.id,
        refereeName: match.referee.name,
        refereeSlug: match.referee.slug,
        refereePhoto: match.referee.photo,
        teamId: match.homeTeam.id,
        teamName: match.homeTeam.name,
        teamLogo: match.homeTeam.logo,
        leagueName: match.homeTeam.league.name,
        matches: 0,
        yellowCards: 0,
        redCards: 0,
        over25Count: 0,
        over35Count: 0,
        over45Count: 0,
      };
    }
    combos[homeKey].matches++;
    combos[homeKey].yellowCards += match.stats.homeYellowCards;
    combos[homeKey].redCards += match.stats.homeRedCards;
    if (totalCards > 2.5) combos[homeKey].over25Count++;
    if (totalCards > 3.5) combos[homeKey].over35Count++;
    if (totalCards > 4.5) combos[homeKey].over45Count++;

    // Away team combo
    const awayKey = `${match.refereeId}-${match.awayTeamId}`;
    if (!combos[awayKey]) {
      combos[awayKey] = {
        refereeId: match.referee.id,
        refereeName: match.referee.name,
        refereeSlug: match.referee.slug,
        refereePhoto: match.referee.photo,
        teamId: match.awayTeam.id,
        teamName: match.awayTeam.name,
        teamLogo: match.awayTeam.logo,
        leagueName: match.awayTeam.league.name,
        matches: 0,
        yellowCards: 0,
        redCards: 0,
        over25Count: 0,
        over35Count: 0,
        over45Count: 0,
      };
    }
    combos[awayKey].matches++;
    combos[awayKey].yellowCards += match.stats.awayYellowCards;
    combos[awayKey].redCards += match.stats.awayRedCards;
    if (totalCards > 2.5) combos[awayKey].over25Count++;
    if (totalCards > 3.5) combos[awayKey].over35Count++;
    if (totalCards > 4.5) combos[awayKey].over45Count++;
  }

  return Object.values(combos)
    .filter(c => c.matches >= 3)
    .map(c => ({
      refereeId: c.refereeId,
      refereeName: c.refereeName,
      refereeSlug: c.refereeSlug,
      refereePhoto: c.refereePhoto,
      teamId: c.teamId,
      teamName: c.teamName,
      teamLogo: c.teamLogo,
      leagueName: c.leagueName,
      matchCount: c.matches,
      totalYellowCards: c.yellowCards,
      totalRedCards: c.redCards,
      avgYellowCards: c.yellowCards / c.matches,
      avgRedCards: c.redCards / c.matches,
      over25Rate: (c.over25Count / c.matches) * 100,
      over35Rate: (c.over35Count / c.matches) * 100,
      over45Rate: (c.over45Count / c.matches) * 100,
    }))
    .sort((a, b) => b.over35Rate - a.over35Rate);
}

export default async function SureCardsPage() {
  const combos = await getRefereeTeamCombos();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Sure Cards Finder</h1>
        <p className="text-muted-foreground mt-2">
          Discover referee-team combinations with the highest historical card rates
        </p>
      </div>

      <SureCardsClient combos={combos} />
    </div>
  );
}
