import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeagueComparisonDashboard, { LeagueStats } from '@/components/LeagueComparisonDashboard';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}));

const mockLeagues: LeagueStats[] = [
  {
    apiId: 39,
    name: 'Premier League',
    country: 'England',
    logo: 'https://example.com/pl.png',
    matchCount: 200,
    refereeCount: 20,
    avgYellowCards: 3.5,
    avgRedCards: 0.15,
    avgPenalties: 0.25,
    avgFouls: 22.0,
    strictnessIndex: 3.95,
  },
  {
    apiId: 140,
    name: 'La Liga',
    country: 'Spain',
    logo: 'https://example.com/laliga.png',
    matchCount: 190,
    refereeCount: 18,
    avgYellowCards: 4.2,
    avgRedCards: 0.2,
    avgPenalties: 0.3,
    avgFouls: 25.0,
    strictnessIndex: 4.8,
  },
  {
    apiId: 135,
    name: 'Serie A',
    country: 'Italy',
    logo: 'https://example.com/seriea.png',
    matchCount: 180,
    refereeCount: 22,
    avgYellowCards: 4.5,
    avgRedCards: 0.18,
    avgPenalties: 0.35,
    avgFouls: 24.0,
    strictnessIndex: 5.04,
  },
  {
    apiId: 78,
    name: 'Bundesliga',
    country: 'Germany',
    logo: 'https://example.com/bundesliga.png',
    matchCount: 150,
    refereeCount: 15,
    avgYellowCards: 3.2,
    avgRedCards: 0.1,
    avgPenalties: 0.2,
    avgFouls: 20.0,
    strictnessIndex: 3.5,
  },
  {
    apiId: 61,
    name: 'Ligue 1',
    country: 'France',
    logo: 'https://example.com/ligue1.png',
    matchCount: 170,
    refereeCount: 17,
    avgYellowCards: 3.8,
    avgRedCards: 0.12,
    avgPenalties: 0.28,
    avgFouls: 21.5,
    strictnessIndex: 4.16,
  },
];

describe('LeagueComparisonDashboard', () => {
  describe('Rendering', () => {
    it('renders the dashboard with league data', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Check that all league names are displayed (use getAllByText for multiple occurrences)
      expect(screen.getAllByText('Premier League').length).toBeGreaterThan(0);
      expect(screen.getAllByText('La Liga').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Serie A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bundesliga').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ligue 1').length).toBeGreaterThan(0);
    });

    it('displays empty state when no leagues provided', () => {
      render(<LeagueComparisonDashboard leagues={[]} />);

      expect(screen.getByText('No league data available')).toBeInTheDocument();
    });

    it('displays empty state when leagues have no matches', () => {
      const emptyLeagues = mockLeagues.map(l => ({ ...l, matchCount: 0 }));
      render(<LeagueComparisonDashboard leagues={emptyLeagues} />);

      expect(screen.getByText('No league data available')).toBeInTheDocument();
    });

    it('renders quick stats rankings', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Check for ranking labels
      expect(screen.getByText('Most Yellow Cards')).toBeInTheDocument();
      expect(screen.getByText('Least Yellow Cards')).toBeInTheDocument();
      expect(screen.getByText('Most Red Cards')).toBeInTheDocument();
      expect(screen.getByText('Strictest League')).toBeInTheDocument();
      expect(screen.getByText('Most Lenient')).toBeInTheDocument();
    });

    it('renders charts', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('renders betting insights section', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      expect(screen.getByText('Betting Insights')).toBeInTheDocument();
      expect(screen.getByText('Best for Over Cards:')).toBeInTheDocument();
      expect(screen.getByText('Best for Under Cards:')).toBeInTheDocument();
    });
  });

  describe('Rankings Calculation', () => {
    it('correctly identifies the strictest league', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Serie A has the highest strictness index (5.04)
      const strictestLabel = screen.getByText('Strictest League');
      const strictestSection = strictestLabel.closest('div')?.parentElement;
      expect(strictestSection).toHaveTextContent('Serie A');
    });

    it('correctly identifies the most lenient league', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Bundesliga has the lowest strictness index (3.5)
      const lenientLabel = screen.getByText('Most Lenient');
      const lenientSection = lenientLabel.closest('div')?.parentElement;
      expect(lenientSection).toHaveTextContent('Bundesliga');
    });

    it('correctly identifies league with most yellow cards', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Serie A has highest avgYellowCards (4.5)
      const mostYellowLabel = screen.getByText('Most Yellow Cards');
      const mostYellowSection = mostYellowLabel.closest('div')?.parentElement;
      expect(mostYellowSection).toHaveTextContent('Serie A');
    });

    it('correctly identifies league with least yellow cards', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Bundesliga has lowest avgYellowCards (3.2)
      const leastYellowLabel = screen.getByText('Least Yellow Cards');
      const leastYellowSection = leastYellowLabel.closest('div')?.parentElement;
      expect(leastYellowSection).toHaveTextContent('Bundesliga');
    });
  });

  describe('Sorting', () => {
    it('allows sorting by different metrics', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toBeInTheDocument();

      // Change sort to yellow cards
      fireEvent.change(sortSelect, { target: { value: 'avgYellowCards' } });

      // The table should now be sorted by yellow cards
      const rows = screen.getAllByRole('row');
      // First data row (after header) should be Serie A (highest yellow)
      expect(rows[1]).toHaveTextContent('Serie A');
    });

    it('has all sort options available', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      const sortSelect = screen.getByRole('combobox');
      const options = sortSelect.querySelectorAll('option');

      expect(options).toHaveLength(5);
      expect(screen.getByText('Sort by Strictness')).toBeInTheDocument();
      expect(screen.getByText('Sort by Yellow Cards')).toBeInTheDocument();
      expect(screen.getByText('Sort by Red Cards')).toBeInTheDocument();
      expect(screen.getByText('Sort by Penalties')).toBeInTheDocument();
      expect(screen.getByText('Sort by Matches')).toBeInTheDocument();
    });
  });

  describe('League Selection', () => {
    it('allows selecting leagues for radar chart', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Find and click on a league button
      const premierLeagueBtn = screen.getByRole('button', { name: /Premier Le/i });
      fireEvent.click(premierLeagueBtn);

      // Button should change style when selected
      expect(premierLeagueBtn).toHaveClass('bg-primary');
    });

    it('displays instruction text for league selection', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      expect(screen.getByText('Click to select up to 5 leagues')).toBeInTheDocument();
    });
  });

  describe('Table Display', () => {
    it('displays all statistics columns', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      expect(screen.getByText('Matches')).toBeInTheDocument();
      expect(screen.getByText('Referees')).toBeInTheDocument();
      expect(screen.getByText('Avg Yellow')).toBeInTheDocument();
      expect(screen.getByText('Avg Red')).toBeInTheDocument();
      expect(screen.getByText('Avg Penalties')).toBeInTheDocument();
      expect(screen.getByText('Strictness')).toBeInTheDocument();
    });

    it('displays league statistics correctly', () => {
      render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Check Premier League stats are displayed
      expect(screen.getByText('200')).toBeInTheDocument(); // matchCount
      expect(screen.getByText('20')).toBeInTheDocument(); // refereeCount
      expect(screen.getByText('3.50')).toBeInTheDocument(); // avgYellowCards
    });

    it('displays rating bars for each league', () => {
      const { container } = render(<LeagueComparisonDashboard leagues={mockLeagues} />);

      // Check for rating bars (progress bars in the Rating column)
      const ratingBars = container.querySelectorAll('.h-2.bg-secondary.rounded-full');
      expect(ratingBars.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles single league correctly', () => {
      render(<LeagueComparisonDashboard leagues={[mockLeagues[0]]} />);

      expect(screen.getAllByText('Premier League').length).toBeGreaterThan(0);
      // Should still show rankings even with single league
      expect(screen.getByText('Strictest League')).toBeInTheDocument();
    });

    it('handles leagues with zero values', () => {
      const zeroLeague: LeagueStats = {
        apiId: 999,
        name: 'Test League',
        country: 'Test',
        logo: null,
        matchCount: 10,
        refereeCount: 5,
        avgYellowCards: 0,
        avgRedCards: 0,
        avgPenalties: 0,
        avgFouls: 0,
        strictnessIndex: 0,
      };

      render(<LeagueComparisonDashboard leagues={[...mockLeagues, zeroLeague]} />);

      // Test League should appear multiple times (in rankings, buttons, table)
      expect(screen.getAllByText('Test League').length).toBeGreaterThan(0);
    });

    it('handles leagues without logos', () => {
      const noLogoLeagues = mockLeagues.map(l => ({ ...l, logo: null }));
      render(<LeagueComparisonDashboard leagues={noLogoLeagues} />);

      // Should still render without errors
      expect(screen.getAllByText('Premier League').length).toBeGreaterThan(0);
    });
  });
});
