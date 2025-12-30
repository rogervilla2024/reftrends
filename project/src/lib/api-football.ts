const API_KEY = process.env.API_FOOTBALL_KEY || '';
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

// League IDs for major European leagues
export const LEAGUE_IDS = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
} as const;

export async function getFixtures(leagueId: number, season: number): Promise<{ response: Fixture[] }> {
  return apiRequest('/fixtures', {
    league: leagueId.toString(),
    season: season.toString(),
  });
}

export async function getTodaysFixtures(): Promise<{ response: Fixture[] }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const leagueIds = Object.values(LEAGUE_IDS).join('-');

  return apiRequest('/fixtures', {
    date: today,
    league: leagueIds,
  });
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
    if (fixture.referee && fixture.referee.trim() !== '') {
      const fixtureDate = new Date(fixture.date);
      const timeStr = fixtureDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      assignments.push({
        referee: fixture.referee.trim(),
        fixture: {
          id: fixture.id,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeLogo: fixture.teams.home.logo,
          awayLogo: fixture.teams.away.logo,
          time: timeStr,
          venue: fixture.venue.name,
          league: fixture.league.name,
          leagueId: fixture.league.id,
        },
      });
    }
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
