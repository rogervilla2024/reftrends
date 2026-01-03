const API_KEY = process.env.API_FOOTBALL_KEY || 'ea04c7309495164f85f3f5fdb5567896';
const BASE_URL = 'https://v3.football.api-sports.io';

interface RateLimiter {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number;
}

const rateLimiter: RateLimiter = {
  tokens: 30,
  lastRefill: Date.now(),
  maxTokens: 30,
  refillRate: 60000, // 1 minute
};

function checkRateLimit(): boolean {
  const now = Date.now();
  const elapsed = now - rateLimiter.lastRefill;

  if (elapsed >= rateLimiter.refillRate) {
    rateLimiter.tokens = rateLimiter.maxTokens;
    rateLimiter.lastRefill = now;
  }

  if (rateLimiter.tokens > 0) {
    rateLimiter.tokens--;
    return true;
  }

  return false;
}

async function apiRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: number;
}

export interface Fixture {
  id: number;
  referee: string | null;
  date: string;
  venue: {
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
  };
  league: {
    id: number;
    name: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface FixtureStatistics {
  fixtureId: number;
  cards: {
    yellow: number;
    red: number;
  };
  fouls: number;
  penalties: {
    won: number;
    missed: number;
    scored: number;
  };
}

// League IDs for all supported leagues
export const LEAGUE_IDS = {
  // Top 5 European Leagues
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  // Additional European Leagues
  PRIMEIRA_LIGA: 94,
  EREDIVISIE: 88,
  BELGIAN_PRO_LEAGUE: 144,
  SUPER_LIG: 203,
  SUPERLIGA_DENMARK: 119,
  // UEFA Competitions
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
  EURO_CHAMPIONSHIP: 4,
  // FIFA Competitions
  WORLD_CUP: 1,
  CLUB_WORLD_CUP: 15,
} as const;

// League metadata for display
export const LEAGUE_INFO: Record<number, { name: string; country: string; flag: string; type: 'league' | 'cup' }> = {
  // Top 5
  39: { name: 'Premier League', country: 'England', flag: '', type: 'league' },
  140: { name: 'La Liga', country: 'Spain', flag: '', type: 'league' },
  135: { name: 'Serie A', country: 'Italy', flag: '', type: 'league' },
  78: { name: 'Bundesliga', country: 'Germany', flag: '', type: 'league' },
  61: { name: 'Ligue 1', country: 'France', flag: '', type: 'league' },
  // Additional
  94: { name: 'Primeira Liga', country: 'Portugal', flag: '', type: 'league' },
  88: { name: 'Eredivisie', country: 'Netherlands', flag: '', type: 'league' },
  144: { name: 'Belgian Pro League', country: 'Belgium', flag: '', type: 'league' },
  203: { name: 'Super Lig', country: 'Turkey', flag: '', type: 'league' },
  119: { name: 'Superliga', country: 'Denmark', flag: '', type: 'league' },
  // UEFA
  2: { name: 'UEFA Champions League', country: 'Europe', flag: '', type: 'cup' },
  3: { name: 'UEFA Europa League', country: 'Europe', flag: '', type: 'cup' },
  848: { name: 'UEFA Conference League', country: 'Europe', flag: '', type: 'cup' },
  4: { name: 'UEFA Euro Championship', country: 'Europe', flag: '', type: 'cup' },
  // FIFA
  1: { name: 'FIFA World Cup', country: 'World', flag: '', type: 'cup' },
  15: { name: 'FIFA Club World Cup', country: 'World', flag: '', type: 'cup' },
};

export async function getFixtures(leagueId: number, season: number): Promise<{ response: Fixture[] }> {
  return apiRequest('/fixtures', {
    league: leagueId.toString(),
    season: season.toString(),
  });
}

export async function getTodaysFixtures(): Promise<{ response: Fixture[] }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Fetch all fixtures for today (API doesn't support multiple leagues in one call)
  const allFixtures = await apiRequest<{ response: Fixture[] }>('/fixtures', {
    date: today,
  });

  // Filter to only include our supported leagues
  const supportedLeagueIds = new Set<number>(Object.values(LEAGUE_IDS));
  const filteredFixtures = allFixtures.response.filter(
    fixture => supportedLeagueIds.has(fixture.league.id)
  );

  return { response: filteredFixtures };
}

export interface TodaysRefereeAssignment {
  referee: string;
  fixture: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeLogo: string;
    awayLogo: string;
    time: string;
    venue: string;
    league: string;
    leagueId: number;
  };
}

export function extractTodaysAssignments(fixtures: Fixture[]): TodaysRefereeAssignment[] {
  const assignments: TodaysRefereeAssignment[] = [];

  for (const fixture of fixtures) {
    let timeStr = '--:--';
    try {
      const fixtureDate = new Date(fixture.date);
      if (!isNaN(fixtureDate.getTime())) {
        timeStr = fixtureDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        });
      }
    } catch {
      timeStr = '--:--';
    }

    // Include all fixtures, show "TBA" if referee not assigned yet
    const refereeName = fixture.referee && fixture.referee.trim() !== ''
      ? fixture.referee.trim()
      : 'TBA';

    assignments.push({
      referee: refereeName,
      fixture: {
        id: fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeLogo: fixture.teams.home.logo,
        awayLogo: fixture.teams.away.logo,
        time: timeStr,
        venue: fixture.venue?.name || 'TBA',
        league: fixture.league.name,
        leagueId: fixture.league.id,
      },
    });
  }

  // Sort by time
  return assignments.sort((a, b) => a.fixture.time.localeCompare(b.fixture.time));
}

export async function getFixtureStatistics(fixtureId: number): Promise<{ response: unknown[] }> {
  return apiRequest('/fixtures/statistics', {
    fixture: fixtureId.toString(),
  });
}

export async function getFixtureEvents(fixtureId: number): Promise<{ response: unknown[] }> {
  return apiRequest('/fixtures/events', {
    fixture: fixtureId.toString(),
  });
}

export async function getLeagues(): Promise<{ response: { league: League }[] }> {
  return apiRequest('/leagues');
}

export async function getReferees(leagueId: number, season: number): Promise<{ response: unknown[] }> {
  return apiRequest('/referees', {
    league: leagueId.toString(),
    season: season.toString(),
  });
}

// Referee data extracted from fixtures
export interface ExtractedReferee {
  name: string;
  fixtureId: number;
  leagueId: number;
  season: number;
  date: string;
}

// Extract unique referees from a list of fixtures
export function extractRefereesFromFixtures(fixtures: Fixture[]): ExtractedReferee[] {
  const referees: ExtractedReferee[] = [];

  for (const fixture of fixtures) {
    if (fixture.referee && fixture.referee.trim() !== '') {
      referees.push({
        name: fixture.referee.trim(),
        fixtureId: fixture.id,
        leagueId: fixture.league.id,
        season: fixture.league.season,
        date: fixture.date,
      });
    }
  }

  return referees;
}

// Get unique referee names from fixtures
export function getUniqueRefereeNames(fixtures: Fixture[]): string[] {
  const refereeSet = new Set<string>();

  for (const fixture of fixtures) {
    if (fixture.referee && fixture.referee.trim() !== '') {
      refereeSet.add(fixture.referee.trim());
    }
  }

  return Array.from(refereeSet).sort();
}

// Generate a URL-friendly slug from referee name
export function generateRefereeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Group fixtures by referee
export function groupFixturesByReferee(fixtures: Fixture[]): Map<string, Fixture[]> {
  const groupedFixtures = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    if (fixture.referee && fixture.referee.trim() !== '') {
      const refName = fixture.referee.trim();
      const existing = groupedFixtures.get(refName) || [];
      existing.push(fixture);
      groupedFixtures.set(refName, existing);
    }
  }

  return groupedFixtures;
}

// Calculate basic stats from fixtures for a referee
export interface RefereeBasicStats {
  name: string;
  matchCount: number;
  leagues: number[];
  firstMatch: string;
  lastMatch: string;
}

export function calculateRefereeBasicStats(
  refereeName: string,
  fixtures: Fixture[]
): RefereeBasicStats | null {
  const refereeFixtures = fixtures.filter(
    f => f.referee?.trim() === refereeName
  );

  if (refereeFixtures.length === 0) return null;

  const sortedFixtures = refereeFixtures.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const leagueIds = Array.from(new Set(refereeFixtures.map(f => f.league.id)));

  return {
    name: refereeName,
    matchCount: refereeFixtures.length,
    leagues: leagueIds,
    firstMatch: sortedFixtures[0].date,
    lastMatch: sortedFixtures[sortedFixtures.length - 1].date,
  };
}

export { apiRequest };
