import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OddsMovementChart from '@/components/OddsMovementChart';

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

describe('OddsMovementChart', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      render(<OddsMovementChart />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('All Markets Movement')).toBeInTheDocument();
    });

    it('shows timeframe buttons', () => {
      render(<OddsMovementChart />);

      expect(screen.getByText('24 Hours')).toBeInTheDocument();
      expect(screen.getByText('3 Days')).toBeInTheDocument();
      expect(screen.getByText('7 Days')).toBeInTheDocument();
    });

    it('displays market selector', () => {
      render(<OddsMovementChart />);

      expect(screen.getByDisplayValue('Over/Under 3.5 Cards')).toBeInTheDocument();
    });

    it('shows the chart', () => {
      render(<OddsMovementChart />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('displays understanding section', () => {
      render(<OddsMovementChart />);

      expect(screen.getByText('Understanding Odds Movement')).toBeInTheDocument();
      expect(screen.getByText('Shortening Odds')).toBeInTheDocument();
      expect(screen.getByText('Drifting Odds')).toBeInTheDocument();
    });

    it('shows disclaimer', () => {
      render(<OddsMovementChart />);

      expect(screen.getByText(/This odds movement data is simulated/)).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('can switch timeframes', () => {
      render(<OddsMovementChart />);

      const oneDay = screen.getByText('24 Hours');
      const threeDays = screen.getByText('3 Days');
      const sevenDays = screen.getByText('7 Days');

      // 3 days is default
      expect(threeDays).toHaveClass('bg-primary');

      // Click 24 Hours
      fireEvent.click(oneDay);
      expect(oneDay).toHaveClass('bg-primary');

      // Click 7 Days
      fireEvent.click(sevenDays);
      expect(sevenDays).toHaveClass('bg-primary');
    });

    it('can change market selection', () => {
      render(<OddsMovementChart />);

      const select = screen.getByDisplayValue('Over/Under 3.5 Cards');
      fireEvent.change(select, { target: { value: '2.5' } });

      // Chart title should update
      expect(screen.getByText('Odds Movement - Over/Under 2.5 Cards')).toBeInTheDocument();
    });
  });

  describe('Markets Table', () => {
    it('shows all markets in the table', () => {
      render(<OddsMovementChart />);

      // Use getAllByText since market names may appear multiple times (in table and chart legend)
      expect(screen.getAllByText('Over 2.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Under 2.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Over 3.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Under 3.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Over 4.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Under 4.5 Cards').length).toBeGreaterThan(0);
    });

    it('displays table headers', () => {
      render(<OddsMovementChart />);

      // Market appears as both label and table header
      expect(screen.getAllByText('Market').length).toBeGreaterThan(0);
      expect(screen.getByText('Opening')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Change')).toBeInTheDocument();
      expect(screen.getByText('Trend')).toBeInTheDocument();
      // Volatility appears in table header and understanding section
      expect(screen.getAllByText('Volatility').length).toBeGreaterThan(0);
    });

    it('shows trend labels', () => {
      render(<OddsMovementChart />);

      // Should have at least one of these trend labels
      const trends = ['Shortening', 'Drifting', 'Stable'];
      const foundTrends = trends.filter(trend =>
        screen.queryAllByText(trend).length > 0
      );
      expect(foundTrends.length).toBeGreaterThan(0);
    });

    it('shows volatility indicators', () => {
      render(<OddsMovementChart />);

      const volatilities = ['high', 'medium', 'low'];
      const foundVolatility = volatilities.some(v =>
        screen.queryAllByText(v).length > 0
      );
      expect(foundVolatility).toBe(true);
    });
  });

  describe('Chart Title', () => {
    it('updates chart title when market changes', () => {
      render(<OddsMovementChart />);

      // Default is 3.5
      expect(screen.getByText('Odds Movement - Over/Under 3.5 Cards')).toBeInTheDocument();

      // Change to 4.5
      const select = screen.getByDisplayValue('Over/Under 3.5 Cards');
      fireEvent.change(select, { target: { value: '4.5' } });

      expect(screen.getByText('Odds Movement - Over/Under 4.5 Cards')).toBeInTheDocument();
    });
  });

  describe('Understanding Section', () => {
    it('explains steam moves', () => {
      render(<OddsMovementChart />);

      expect(screen.getByText('Steam Moves')).toBeInTheDocument();
    });

    it('explains volatility', () => {
      render(<OddsMovementChart />);

      // The Volatility header in the understanding section
      const volatilityHeaders = screen.getAllByText('Volatility');
      expect(volatilityHeaders.length).toBeGreaterThan(0);
    });
  });
});
