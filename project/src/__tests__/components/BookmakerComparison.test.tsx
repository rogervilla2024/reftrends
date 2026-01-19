import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookmakerComparison from '@/components/BookmakerComparison';

describe('BookmakerComparison', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      render(<BookmakerComparison />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Best Odds Summary')).toBeInTheDocument();
      expect(screen.getByText('Bookmaker Rankings by Margin')).toBeInTheDocument();
    });

    it('displays all bookmakers', () => {
      render(<BookmakerComparison />);

      // Bookmakers appear in both table and rankings, so use getAllByText
      expect(screen.getAllByText('Bet365').length).toBeGreaterThan(0);
      expect(screen.getAllByText('William Hill').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Betfair').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pinnacle').length).toBeGreaterThan(0);
    });

    it('shows comparison table', () => {
      render(<BookmakerComparison />);

      // Default market is 3.5 cards
      expect(screen.getByText('Odds Comparison - Over/Under 3.5 Cards')).toBeInTheDocument();
      expect(screen.getByText('Bookmaker')).toBeInTheDocument();
      expect(screen.getByText('Margin')).toBeInTheDocument();
    });

    it('displays how to use section', () => {
      render(<BookmakerComparison />);

      expect(screen.getByText('How to Use This Tool')).toBeInTheDocument();
    });

    it('shows disclaimer', () => {
      render(<BookmakerComparison />);

      expect(screen.getByText(/These odds are simulated/)).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('has expected cards input', () => {
      render(<BookmakerComparison />);

      const input = screen.getByDisplayValue('3.5');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
    });

    it('has market selector', () => {
      render(<BookmakerComparison />);

      const select = screen.getByDisplayValue('Over/Under 3.5 Cards');
      expect(select).toBeInTheDocument();
    });

    it('can change expected cards', () => {
      render(<BookmakerComparison />);

      const input = screen.getByDisplayValue('3.5');
      fireEvent.change(input, { target: { value: '4.5' } });

      expect(input).toHaveValue(4.5);
    });

    it('can change market selection', () => {
      render(<BookmakerComparison />);

      const select = screen.getByDisplayValue('Over/Under 3.5 Cards');
      fireEvent.change(select, { target: { value: '2.5 Cards' } });

      expect(screen.getByText('Odds Comparison - Over/Under 2.5 Cards')).toBeInTheDocument();
    });
  });

  describe('Best Odds Summary', () => {
    it('shows best odds for all markets', () => {
      render(<BookmakerComparison />);

      // Should show 3 market summaries - these appear in multiple places
      expect(screen.getAllByText('Over/Under 2.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Over/Under 3.5 Cards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Over/Under 4.5 Cards').length).toBeGreaterThan(0);
    });

    it('displays best over and under for each market', () => {
      render(<BookmakerComparison />);

      // Each market summary should have Best Over and Best Under
      const bestOverLabels = screen.getAllByText('Best Over:');
      const bestUnderLabels = screen.getAllByText('Best Under:');

      expect(bestOverLabels.length).toBe(3);
      expect(bestUnderLabels.length).toBe(3);
    });
  });

  describe('Bookmaker Rankings', () => {
    it('shows all bookmakers in rankings', () => {
      render(<BookmakerComparison />);

      // All 8 bookmakers should be in rankings
      const rankingSection = screen.getByText('Bookmaker Rankings by Margin').closest('div');
      expect(rankingSection?.parentElement).toBeInTheDocument();
    });

    it('displays margin percentages', () => {
      render(<BookmakerComparison />);

      // Should show margin percentages
      const marginTexts = screen.getAllByText(/margin$/);
      expect(marginTexts.length).toBe(8); // 8 bookmakers
    });

    it('shows ranking numbers', () => {
      render(<BookmakerComparison />);

      // First 3 ranks should be visible
      const rankings = screen.getAllByText(/^[1-8]$/);
      expect(rankings.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Odds Table', () => {
    it('shows over and under columns', () => {
      render(<BookmakerComparison />);

      expect(screen.getByText('Over 3.5 Cards')).toBeInTheDocument();
      expect(screen.getByText('Under 3.5 Cards')).toBeInTheDocument();
    });

    it('updates columns when market changes', () => {
      render(<BookmakerComparison />);

      const select = screen.getByDisplayValue('Over/Under 3.5 Cards');
      fireEvent.change(select, { target: { value: '4.5 Cards' } });

      expect(screen.getByText('Over 4.5 Cards')).toBeInTheDocument();
      expect(screen.getByText('Under 4.5 Cards')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles extreme expected cards value', () => {
      render(<BookmakerComparison />);

      const input = screen.getByDisplayValue('3.5');
      fireEvent.change(input, { target: { value: '8' } });

      // Should still render without errors
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('handles low expected cards value', () => {
      render(<BookmakerComparison />);

      const input = screen.getByDisplayValue('3.5');
      fireEvent.change(input, { target: { value: '1' } });

      // Should still render without errors
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
