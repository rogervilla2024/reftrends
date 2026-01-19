import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DailyValueBetsSection from '@/components/DailyValueBetsSection';

// Mock next/dynamic to render the component directly
vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    const Component = React.lazy(importFn);
    return function DynamicComponent(props: Record<string, unknown>) {
      return (
        <React.Suspense fallback={<div>Loading value bets...</div>}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  },
}));

// Mock the DailyValueBets component
vi.mock('@/components/DailyValueBets', () => ({
  default: ({ fixtures }: { fixtures: unknown[] }) => (
    <div data-testid="daily-value-bets">
      DailyValueBets with {fixtures.length} fixtures
    </div>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockFixturesWithReferee = [
  {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    kickoff: '2024-01-15T15:00:00Z',
    league: 'Premier League',
    referee: {
      name: 'Michael Oliver',
      slug: 'michael-oliver',
      avgYellowCards: 4.2,
      avgRedCards: 0.15,
      matchesOfficiated: 25,
      strictnessIndex: 4.5,
    },
  },
  {
    id: 2,
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester City',
    kickoff: '2024-01-15T17:30:00Z',
    league: 'Premier League',
    referee: {
      name: 'Anthony Taylor',
      slug: 'anthony-taylor',
      avgYellowCards: 3.8,
      avgRedCards: 0.12,
      matchesOfficiated: 30,
      strictnessIndex: 4.2,
    },
  },
];

const mockFixturesWithoutReferee = [
  {
    id: 1,
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    kickoff: '2024-01-15T15:00:00Z',
    league: 'Test League',
    referee: undefined,
  },
];

describe('DailyValueBetsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<DailyValueBetsSection />);

      expect(screen.getByText(/Loading value bets/)).toBeInTheDocument();
    });
  });

  describe('Success States', () => {
    it('renders DailyValueBets when fixtures with referees are available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithReferee, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByTestId('daily-value-bets')).toBeInTheDocument();
      });

      expect(screen.getByText('DailyValueBets with 2 fixtures')).toBeInTheDocument();
    });

    it('filters out fixtures without referees', async () => {
      const mixedFixtures = [
        mockFixturesWithReferee[0],
        mockFixturesWithoutReferee[0],
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mixedFixtures, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByTestId('daily-value-bets')).toBeInTheDocument();
      });

      // Should only have 1 fixture (the one with referee)
      expect(screen.getByText('DailyValueBets with 1 fixtures')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows message when no fixtures with referees today', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithoutReferee, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByText('Value Bets')).toBeInTheDocument();
      });

      expect(screen.getByText(/No matches with referee assignments today/)).toBeInTheDocument();
    });

    it('shows upcoming message when isUpcoming is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithoutReferee, isUpcoming: true }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByText('Value Bets')).toBeInTheDocument();
      });

      expect(screen.getByText(/No referee assignments available for upcoming matches/)).toBeInTheDocument();
    });

    it('shows message when empty fixtures array returned', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: [], isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByText('Value Bets')).toBeInTheDocument();
      });

      expect(screen.getByText(/No matches with referee assignments today/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders nothing on API error (silent fail)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { container } = render(<DailyValueBetsSection />);

      await waitFor(() => {
        // After error, component should render nothing
        expect(container.querySelector('[data-testid="daily-value-bets"]')).not.toBeInTheDocument();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading value bets/)).not.toBeInTheDocument();
      });
    });

    it('handles fetch throwing an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(<DailyValueBetsSection />);

      await waitFor(() => {
        // After error, component should render nothing
        expect(container.querySelector('[data-testid="daily-value-bets"]')).not.toBeInTheDocument();
      });
    });

    it('handles malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // No fixtures property
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        // Should handle missing fixtures gracefully
        expect(screen.getByText('Value Bets')).toBeInTheDocument();
      });
    });
  });

  describe('API Call', () => {
    it('calls the correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithReferee, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/value-bets',
          expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
      });
    });

    it('only fetches once on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithReferee, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        expect(screen.getByTestId('daily-value-bets')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on section when content is loaded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fixtures: mockFixturesWithReferee, isUpcoming: false }),
      });

      render(<DailyValueBetsSection />);

      await waitFor(() => {
        const section = screen.getByRole('region', { name: /daily value bets/i });
        expect(section).toBeInTheDocument();
      });
    });
  });
});
