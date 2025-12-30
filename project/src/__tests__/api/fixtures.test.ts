import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  default: {
    match: {
      findMany: vi.fn(),
    },
  },
}));

// Import after mocking
import prisma from '@/lib/db';
import { GET } from '@/app/api/fixtures/route';

describe('GET /api/fixtures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a list of fixtures', async () => {
    const mockFixtures = [
      {
        id: 1,
        date: new Date('2024-12-30'),
        status: 'FT',
        homeGoals: 2,
        awayGoals: 1,
        league: { id: 1, name: 'Premier League' },
        homeTeam: { id: 1, name: 'Arsenal' },
        awayTeam: { id: 2, name: 'Chelsea' },
        referee: { id: 1, name: 'Anthony Taylor' },
        stats: { homeYellowCards: 2, awayYellowCards: 3 },
      },
    ];

    vi.mocked(prisma.match.findMany).mockResolvedValue(mockFixtures as never);

    const request = new Request('http://localhost:3000/api/fixtures');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].homeTeam.name).toBe('Arsenal');
  });

  it('filters by leagueId when provided', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures?leagueId=39');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { leagueId: 39 },
      })
    );
  });

  it('filters by refereeId when provided', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures?refereeId=5');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { refereeId: 5 },
      })
    );
  });

  it('filters by both leagueId and refereeId', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures?leagueId=39&refereeId=5');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { leagueId: 39, refereeId: 5 },
      })
    );
  });

  it('returns fixtures sorted by date descending', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { date: 'desc' },
      })
    );
  });

  it('limits results to 50 fixtures', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
      })
    );
  });

  it('includes related entities in the response', async () => {
    vi.mocked(prisma.match.findMany).mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/fixtures');
    await GET(request);

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          referee: true,
          stats: true,
        },
      })
    );
  });

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.match.findMany).mockRejectedValue(new Error('DB Error'));

    const request = new Request('http://localhost:3000/api/fixtures');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch fixtures');
  });
});
