import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  default: {
    referee: {
      findMany: vi.fn(),
    },
  },
}));

// Import after mocking
import prisma from '@/lib/db';
import { GET } from '@/app/api/referees/route';

describe('GET /api/referees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a list of referees', async () => {
    const mockReferees = [
      {
        id: 1,
        apiId: 100,
        name: 'Anthony Taylor',
        slug: 'anthony-taylor',
        photo: 'https://example.com/photo.jpg',
        nationality: 'England',
        seasonStats: [],
      },
      {
        id: 2,
        apiId: 200,
        name: 'Felix Brych',
        slug: 'felix-brych',
        photo: 'https://example.com/photo2.jpg',
        nationality: 'Germany',
        seasonStats: [],
      },
    ];

    vi.mocked(prisma.referee.findMany).mockResolvedValue(mockReferees);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('Anthony Taylor');
    expect(data[1].name).toBe('Felix Brych');
  });

  it('returns referees sorted by name ascending', async () => {
    const mockReferees = [
      { id: 1, name: 'Anthony', slug: 'anthony', seasonStats: [] },
      { id: 2, name: 'Felix', slug: 'felix', seasonStats: [] },
    ];

    vi.mocked(prisma.referee.findMany).mockResolvedValue(mockReferees as never);

    await GET();

    expect(prisma.referee.findMany).toHaveBeenCalledWith({
      include: { seasonStats: true },
      orderBy: { name: 'asc' },
    });
  });

  it('returns 500 on database error', async () => {
    vi.mocked(prisma.referee.findMany).mockRejectedValue(new Error('DB Error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch referees');
  });

  it('includes seasonStats in the response', async () => {
    const mockReferees = [
      {
        id: 1,
        name: 'Anthony Taylor',
        slug: 'anthony-taylor',
        seasonStats: [
          {
            id: 1,
            refereeId: 1,
            season: 2024,
            leagueApiId: 39,
            matchesOfficiated: 25,
            avgYellowCards: 3.5,
            avgRedCards: 0.2,
            strictnessIndex: 6.5,
          },
        ],
      },
    ];

    vi.mocked(prisma.referee.findMany).mockResolvedValue(mockReferees as never);

    const response = await GET();
    const data = await response.json();

    expect(data[0].seasonStats).toHaveLength(1);
    expect(data[0].seasonStats[0].season).toBe(2024);
    expect(data[0].seasonStats[0].avgYellowCards).toBe(3.5);
  });
});
