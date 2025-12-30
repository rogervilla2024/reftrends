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

export { apiRequest };
