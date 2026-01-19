import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RefereeComparisonClient from '@/components/RefereeComparisonClient';

// Mock recharts
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
  Legend: () => <div data-testid="legend" />,
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockRefereeOptions = [
  { id: 1, name: 'Michael Oliver', slug: 'michael-oliver', photo: null, nationality: 'England' },
  { id: 2, name: 'Anthony Taylor', slug: 'anthony-taylor', photo: null, nationality: 'England' },
  { id: 3, name: 'Felix Brych', slug: 'felix-brych', photo: null, nationality: 'Germany' },
  { id: 4, name: 'Daniele Orsato', slug: 'daniele-orsato', photo: null, nationality: 'Italy' },
  { id: 5, name: 'Clement Turpin', slug: 'clement-turpin', photo: null, nationality: 'France' },
];

const mockRefereeStats: Record<number, any> = {
  1: {
    id: 1,
    name: 'Michael Oliver',
    slug: 'michael-oliver',
    photo: null,
    nationality: 'England',
    seasonStats: [
      {
        season: 2024,
        leagueApiId: 39,
        matchesOfficiated: 25,
        totalYellowCards: 90,
        totalRedCards: 3,
        avgYellowCards: 3.6,
        avgRedCards: 0.12,
        totalPenalties: 6,
        avgPenalties: 0.24,
        strictnessIndex: 4.0,
        homeBiasScore: 0.5,
      },
    ],
    careerStats: {
      totalMatches: 250,
      totalYellowCards: 900,
      totalRedCards: 30,
      totalPenalties: 60,
      avgYellowCards: 3.6,
      avgRedCards: 0.12,
      avgPenalties: 0.24,
      avgStrictness: 4.0,
    },
  },
  2: {
    id: 2,
    name: 'Anthony Taylor',
    slug: 'anthony-taylor',
    photo: null,
    nationality: 'England',
    seasonStats: [
      {
        season: 2024,
        leagueApiId: 39,
        matchesOfficiated: 28,
        totalYellowCards: 120,
        totalRedCards: 5,
        avgYellowCards: 4.3,
        avgRedCards: 0.18,
        totalPenalties: 8,
        avgPenalties: 0.29,
        strictnessIndex: 4.8,
        homeBiasScore: 0.48,
      },
    ],
    careerStats: {
      totalMatches: 300,
      totalYellowCards: 1200,
      totalRedCards: 50,
      totalPenalties: 80,
      avgYellowCards: 4.0,
      avgRedCards: 0.17,
      avgPenalties: 0.27,
      avgStrictness: 4.5,
    },
  },
  3: {
    id: 3,
    name: 'Felix Brych',
    slug: 'felix-brych',
    photo: null,
    nationality: 'Germany',
    seasonStats: [],
    careerStats: {
      totalMatches: 400,
      totalYellowCards: 1400,
      totalRedCards: 40,
      totalPenalties: 100,
      avgYellowCards: 3.5,
      avgRedCards: 0.10,
      avgPenalties: 0.25,
      avgStrictness: 3.8,
    },
  },
  4: {
    id: 4,
    name: 'Daniele Orsato',
    slug: 'daniele-orsato',
    photo: null,
    nationality: 'Italy',
    seasonStats: [],
    careerStats: {
      totalMatches: 350,
      totalYellowCards: 1500,
      totalRedCards: 45,
      totalPenalties: 90,
      avgYellowCards: 4.3,
      avgRedCards: 0.13,
      avgPenalties: 0.26,
      avgStrictness: 4.7,
    },
  },
};

const mockLeagueMap = {
  39: 'Premier League',
  78: 'Bundesliga',
};

describe('RefereeComparisonClient', () => {
  describe('Initial Rendering', () => {
    it('renders the component with referee options', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      expect(screen.getByText('Select Referees')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search referee...')).toBeInTheDocument();
    });

    it('displays the empty state when no referees are selected', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      expect(screen.getByText('Select Referees to Compare')).toBeInTheDocument();
      expect(screen.getByText(/Choose at least 2 referees/)).toBeInTheDocument();
    });

    it('shows referee list with match counts', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      expect(screen.getByText('Michael Oliver')).toBeInTheDocument();
      expect(screen.getByText('Anthony Taylor')).toBeInTheDocument();
      expect(screen.getByText('250 matches')).toBeInTheDocument();
      expect(screen.getByText('300 matches')).toBeInTheDocument();
    });
  });

  describe('Referee Selection', () => {
    it('allows selecting a referee', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      const oliverButton = screen.getByText('Michael Oliver').closest('button');
      fireEvent.click(oliverButton!);

      // Check selected tag appears
      expect(screen.getByText('Oliver')).toBeInTheDocument();
    });

    it('shows comparison when 2 referees are selected', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select first referee
      const oliverButton = screen.getByText('Michael Oliver').closest('button');
      fireEvent.click(oliverButton!);

      // Select second referee
      const taylorButton = screen.getByText('Anthony Taylor').closest('button');
      fireEvent.click(taylorButton!);

      // Comparison should now be visible
      expect(screen.getByText('Career Statistics Comparison')).toBeInTheDocument();
      expect(screen.getByText('Average Stats Per Match')).toBeInTheDocument();
      expect(screen.getByText('Referee Profile Comparison')).toBeInTheDocument();
      expect(screen.getByText('Betting Insights')).toBeInTheDocument();
    });

    it('allows removing a selected referee', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select referee
      const oliverButton = screen.getByText('Michael Oliver').closest('button');
      fireEvent.click(oliverButton!);

      // Remove referee
      const removeButton = screen.getByText('×');
      fireEvent.click(removeButton);

      // Should go back to empty state
      expect(screen.getByText('Select Referees to Compare')).toBeInTheDocument();
    });

    it('limits selection to 4 referees', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select 4 referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);
      fireEvent.click(screen.getByText('Felix Brych').closest('button')!);
      fireEvent.click(screen.getByText('Daniele Orsato').closest('button')!);

      // 5th referee button should be disabled
      const turpinButton = screen.getByText('Clement Turpin').closest('button');
      expect(turpinButton).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Search Functionality', () => {
    it('filters referee list based on search query', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search referee...');
      fireEvent.change(searchInput, { target: { value: 'Oliver' } });

      expect(screen.getByText('Michael Oliver')).toBeInTheDocument();
      expect(screen.queryByText('Anthony Taylor')).not.toBeInTheDocument();
    });

    it('shows all referees when search is cleared', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search referee...');

      // Search
      fireEvent.change(searchInput, { target: { value: 'Oliver' } });
      expect(screen.queryByText('Anthony Taylor')).not.toBeInTheDocument();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Anthony Taylor')).toBeInTheDocument();
    });
  });

  describe('Comparison Display', () => {
    it('displays statistics comparison table', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      // Check table headers
      expect(screen.getByText('Total Matches')).toBeInTheDocument();
      expect(screen.getByText('Avg Yellow Cards')).toBeInTheDocument();
      expect(screen.getByText('Avg Red Cards')).toBeInTheDocument();
      expect(screen.getByText('Avg Penalties')).toBeInTheDocument();
      expect(screen.getByText('Strictness Index')).toBeInTheDocument();
    });

    it('displays correct statistics values', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      // Check values
      expect(screen.getByText('250')).toBeInTheDocument(); // Oliver's matches
      expect(screen.getByText('300')).toBeInTheDocument(); // Taylor's matches
    });

    it('renders charts when referees are selected', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      // Check charts are rendered
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('Betting Insights', () => {
    it('displays betting insights section', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      expect(screen.getByText('Betting Insights')).toBeInTheDocument();
      expect(screen.getByText('Card Market Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Head-to-Head Comparison')).toBeInTheDocument();
    });

    it('identifies strictest referee', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      // Taylor should be strictest (4.5 vs 4.0)
      const strictestLabel = screen.getByText('Strictest Referee');
      const strictestSection = strictestLabel.closest('div')?.parentElement;
      expect(strictestSection).toHaveTextContent('Anthony Taylor');
    });

    it('identifies most lenient referee', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      // Oliver should be most lenient (4.0 vs 4.5)
      const lenientLabel = screen.getByText('Most Lenient');
      const lenientSection = lenientLabel.closest('div')?.parentElement;
      expect(lenientSection).toHaveTextContent('Michael Oliver');
    });

    it('displays quick betting tips', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      expect(screen.getByText('Quick Betting Tips')).toBeInTheDocument();
      expect(screen.getByText(/Under bets/)).toBeInTheDocument();
      expect(screen.getByText(/Over bets/)).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('shows export button when referees are selected', () => {
      render(
        <RefereeComparisonClient
          refereeOptions={mockRefereeOptions}
          refereeStats={mockRefereeStats}
          leagueMap={mockLeagueMap}
        />
      );

      // Select two referees
      fireEvent.click(screen.getByText('Michael Oliver').closest('button')!);
      fireEvent.click(screen.getByText('Anthony Taylor').closest('button')!);

      expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    });
  });
});
