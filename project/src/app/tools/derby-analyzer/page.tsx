import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Link from 'next/link';
import DerbyAnalyzerClient from '@/components/DerbyAnalyzerClient';

export const metadata: Metadata = {
  title: 'Derby Analyzer',
  description: 'Analyze referee behavior in derby and rivalry matches. Compare card statistics between derby and regular matches.',
  openGraph: {
    title: 'Derby Analyzer - RefStats',
    description: 'Referee behavior analysis in derby matches.',
    url: 'https://refstats.com/tools/derby-analyzer',
  },
  alternates: {
    canonical: 'https://refstats.com/tools/derby-analyzer',
  },
};

const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

// Define known derbies (team name patterns to match)
const DERBIES = [
  // Premier League
  { teams: ['Manchester United', 'Manchester City'], name: 'Manchester Derby', league: 'Premier League' },
  { teams: ['Liverpool', 'Everton'], name: 'Merseyside Derby', league: 'Premier League' },
  { teams: ['Arsenal', 'Tottenham'], name: 'North London Derby', league: 'Premier League' },
  { teams: ['Chelsea', 'Arsenal'], name: 'London Derby', league: 'Premier League' },
  { teams: ['Chelsea', 'Tottenham'], name: 'London Derby', league: 'Premier League' },
  { teams: ['Liverpool', 'Manchester United'], name: 'Northwest Derby', league: 'Premier League' },
  // La Liga
  { teams: ['Real Madrid', 'Barcelona'], name: 'El Clasico', league: 'La Liga' },
  { teams: ['Real Madrid', 'Atletico Madrid'], name: 'Madrid Derby', league: 'La Liga' },
  { teams: ['Barcelona', 'Espanyol'], name: 'Derbi Barceloni', league: 'La Liga' },
  { teams: ['Sevilla', 'Real Betis'], name: 'Seville Derby', league: 'La Liga' },
  { teams: ['Athletic Bilbao', 'Real Sociedad'], name: 'Basque Derby', league: 'La Liga' },
  // Serie A
  { teams: ['AC Milan', 'Inter'], name: 'Derby della Madonnina', league: 'Serie A' },
  { teams: ['Juventus', 'Torino'], name: 'Derby della Mole', league: 'Serie A' },
  { teams: ['Roma', 'Lazio'], name: 'Derby della Capitale', league: 'Serie A' },
  { teams: ['Juventus', 'Inter'], name: 'Derby d\'Italia', league: 'Serie A' },
  { teams: ['Napoli', 'Roma'], name: 'Derby del Sole', league: 'Serie A' },
  // Bundesliga
  { teams: ['Borussia Dortmund', 'Bayern Munich'], name: 'Der Klassiker', league: 'Bundesliga' },
  { teams: ['Borussia Dortmund', 'Schalke'], name: 'Revierderby', league: 'Bundesliga' },
  { teams: ['Bayern Munich', 'Bayern 1860'], name: 'Munich Derby', league: 'Bundesliga' },
  // Ligue 1
  { teams: ['Paris Saint Germain', 'Marseille'], name: 'Le Classique', league: 'Ligue 1' },
  { teams: ['Lyon', 'Saint-Etienne'], name: 'Derby Rhone-Alpes', league: 'Ligue 1' },
  { teams: ['Monaco', 'Nice'], name: 'Cote d\'Azur Derby', league: 'Ligue 1' },
];

function isDerbyMatch(homeTeam: string, awayTeam: string): { isDerby: boolean; derbyName: string | null } {
  for (const derby of DERBIES) {
    const team1Match = derby.teams.some(t => homeTeam.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(homeTeam.toLowerCase()));
    const team2Match = derby.teams.some(t => awayTeam.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(awayTeam.toLowerCase()));

    if (team1Match && team2Match && homeTeam !== awayTeam) {
      return { isDerby: true, derbyName: derby.name };
    }
  }
  return { isDerby: false, derbyName: null };
}

async function getDerbyData() {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ status: 'FT' }, { status: 'Match Finished' }],
    },
    include: {
      stats: true,
      referee: true,
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const derbyMatches: Array<{
    id: number;
    date: string;
    derbyName: string;
    homeTeam: string;
    awayTeam: string;
    referee: { id: number; name: string; slug: string } | null;
    yellowCards: number;
    redCards: number;
    totalCards: number;
    league: string;
  }> = [];

  const regularMatches: typeof derbyMatches = [];

  matches.forEach(match => {
    if (!match.stats) return;

    const { isDerby, derbyName } = isDerbyMatch(match.homeTeam.name, match.awayTeam.name);
    const matchData = {
      id: match.id,
      date: match.date.toISOString().split('T')[0],
      derbyName: derbyName || '',
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      referee: match.referee ? {
        id: match.referee.id,
        name: match.referee.name,
        slug: match.referee.slug,
      } : null,
      yellowCards: match.stats.yellowCards,
      redCards: match.stats.redCards,
      totalCards: match.stats.yellowCards + match.stats.redCards,
      league: match.league.name,
    };

    if (isDerby) {
      derbyMatches.push(matchData);
    } else {
      regularMatches.push(matchData);
    }
  });

  // Calculate averages
  const derbyAvg = derbyMatches.length > 0
    ? {
        yellow: derbyMatches.reduce((sum, m) => sum + m.yellowCards, 0) / derbyMatches.length,
        red: derbyMatches.reduce((sum, m) => sum + m.redCards, 0) / derbyMatches.length,
        total: derbyMatches.reduce((sum, m) => sum + m.totalCards, 0) / derbyMatches.length,
      }
    : { yellow: 0, red: 0, total: 0 };

  const regularAvg = regularMatches.length > 0
    ? {
        yellow: regularMatches.reduce((sum, m) => sum + m.yellowCards, 0) / regularMatches.length,
        red: regularMatches.reduce((sum, m) => sum + m.redCards, 0) / regularMatches.length,
        total: regularMatches.reduce((sum, m) => sum + m.totalCards, 0) / regularMatches.length,
      }
    : { yellow: 0, red: 0, total: 0 };

  // Referee derby stats
  const refereeStats: Record<number, {
    id: number;
    name: string;
    slug: string;
    derbyMatches: number;
    derbyCards: number;
    regularMatches: number;
    regularCards: number;
    derbies: string[];
  }> = {};

  derbyMatches.forEach(match => {
    if (!match.referee) return;

    if (!refereeStats[match.referee.id]) {
      refereeStats[match.referee.id] = {
        id: match.referee.id,
        name: match.referee.name,
        slug: match.referee.slug,
        derbyMatches: 0,
        derbyCards: 0,
        regularMatches: 0,
        regularCards: 0,
        derbies: [],
      };
    }

    refereeStats[match.referee.id].derbyMatches++;
    refereeStats[match.referee.id].derbyCards += match.totalCards;
    if (!refereeStats[match.referee.id].derbies.includes(match.derbyName)) {
      refereeStats[match.referee.id].derbies.push(match.derbyName);
    }
  });

  regularMatches.forEach(match => {
    if (!match.referee) return;

    if (!refereeStats[match.referee.id]) {
      refereeStats[match.referee.id] = {
        id: match.referee.id,
        name: match.referee.name,
        slug: match.referee.slug,
        derbyMatches: 0,
        derbyCards: 0,
        regularMatches: 0,
        regularCards: 0,
        derbies: [],
      };
    }

    refereeStats[match.referee.id].regularMatches++;
    refereeStats[match.referee.id].regularCards += match.totalCards;
  });

  const refereeList = Object.values(refereeStats)
    .filter(r => r.derbyMatches >= 1)
    .map(r => ({
      ...r,
      derbyAvg: r.derbyMatches > 0 ? r.derbyCards / r.derbyMatches : 0,
      regularAvg: r.regularMatches > 0 ? r.regularCards / r.regularMatches : 0,
      difference: (r.derbyMatches > 0 ? r.derbyCards / r.derbyMatches : 0) -
                  (r.regularMatches > 0 ? r.regularCards / r.regularMatches : 0),
    }))
    .sort((a, b) => b.derbyMatches - a.derbyMatches);

  // Group derbies by name
  const derbyByName: Record<string, typeof derbyMatches> = {};
  derbyMatches.forEach(match => {
    if (!derbyByName[match.derbyName]) {
      derbyByName[match.derbyName] = [];
    }
    derbyByName[match.derbyName].push(match);
  });

  const derbyStats = Object.entries(derbyByName).map(([name, matches]) => ({
    name,
    matchCount: matches.length,
    avgCards: matches.reduce((sum, m) => sum + m.totalCards, 0) / matches.length,
    avgYellow: matches.reduce((sum, m) => sum + m.yellowCards, 0) / matches.length,
    avgRed: matches.reduce((sum, m) => sum + m.redCards, 0) / matches.length,
    recentMatches: matches.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
  })).sort((a, b) => b.avgCards - a.avgCards);

  return {
    derbyMatches: derbyMatches.sort((a, b) => b.date.localeCompare(a.date)),
    comparison: {
      derby: { ...derbyAvg, count: derbyMatches.length },
      regular: { ...regularAvg, count: regularMatches.length },
    },
    referees: refereeList,
    derbyStats,
  };
}

export default async function DerbyAnalyzerPage() {
  const data = await getDerbyData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/tools" className="text-primary hover:underline text-sm mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-3xl font-bold">Derby Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze referee behavior in derby and rivalry matches
        </p>
      </div>

      <DerbyAnalyzerClient data={data} />
    </div>
  );
}
